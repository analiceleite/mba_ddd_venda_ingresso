# AGENTS.md — mba-ddd-venda-ingresso

## Estrutura do projeto

NestJS com camada de domínio DDD isolada em `src/@core/`.  
O `AppModule` conecta o `@core` ao NestJS via `MikroOrmModule.forRoot` + módulos de apresentação (ex.: `OrdersModule`).

```
src/
  main.ts                         # Bootstrap NestJS (PORT env, padrão 3000)
  app.module.ts                   # Módulo raiz NestJS — importa MikroOrmModule e OrdersModule
  mikro-orm.config.ts             # Config MikroORM (MySQL) — registra os schemas do @core, usa env vars
  orders/                         # Apresentação do fluxo de pedido/reserva
    orders.controller.ts          # POST /orders/reserve, GET /orders — monta OrderService com repos MikroORM
    orders.module.ts
  @core/                          # Camada de domínio pura (sem decorators/DI do NestJS)
    common/domain/                # Classes base: Entity, AggregateRoot, ValueObject
      value-objects/              # Uuid, Cpf, Name, MyCollectionFactory (proxy MikroORM)
    common/application/           # Contratos de application — IUnitOfWork (begin/commit/rollback)
    common/infrastructure/        # Re-export de schemas (schemas.ts) — implementação MikroORM em common/infra/
    common/infra/                 # UnitOfWorkMikroOrm (implementação de IUnitOfWork com EntityManager)
    events/domain/entities/       # Event, Partner, EventSection, EventSpot, Customer, Order, SpotReservation
      __tests__/                  # Testes unitários (*.spec.ts)
      partner-id.ts               # PartnerId extraído para quebrar dependência circular
    events/domain/repositories/   # Interfaces de repositório (Customer, Event, Order, Partner)
    events/application/           # Services: CustomerService, EventService, OrderService, PartnerService
    events/infrastructure/        # Mappers + EntitySchemas MikroORM e repositórios concretos (persistence/mikro-orm)
test/
  __mocks__/mikro-orm-core.ts     # Mock manual de @mikro-orm/core para Jest
```

## Fatos de arquitetura

- **`@core/` é TypeScript puro** — sem decorators NestJS, sem DI, sem acoplamento com o framework.
- A camada **domain** concentra as regras de negócio; **application** orquestra casos de uso com UoW; **infrastructure** traduz domínio ↔ banco.
- Hierarquia: `ValueObject` → `Uuid / Cpf / Name`, `Entity` → `AggregateRoot`, `AggregateRoot` → `Event / Partner / Customer / Order`.
- Entidades usam **factory static `create()`** + `constructor` que aceita tanto IDs do domínio quanto strings.
- Value objects **validam na construção** e lançam erros de domínio (`InvalidCpfError`, `InvalidUuidError`).
- `MyCollectionFactory` é um **Proxy** sobre a `Collection` do MikroORM — usado em `EventSection`, `Event` e `Order` para gerenciar coleções de filhos.
- Comportamentos de domínio usam métodos nomeados com intenção de negócio (`changeName`, `publish`, `publishAll`, `confirm`, `cancel`) em vez de setters genéricos ou `update`.
- Agregado `Event` é raiz que contém `EventSection` (sessions), que contém `EventSpot` (spots). `Event.publishAll()` propaga em cascata.
- Reserva de ingresso: `EventSection` expõe `allowReserveSpot`/`markSpotAsReserved`/`unmarkSpotAsReserved` (regras de disponibilidade no domínio). `Order` é raiz que contém `SpotReservation` e muda de `PENDING` → `CONFIRMED`/`CANCELLED` via `confirm()`/`cancel()`.
- `Partner.initEvent(command)` cria um `Event` usando o próprio ID do partner — evita montagem externa do `partner_id`.
- `OrderService.reserve` (application) orquestra a transação entre `Event` e `Order`: valida o spot, marca como reservado e persiste pedido + evento no mesmo UoW.
- A camada **application** é onde ficam os services; recebem repositórios (interfaces de `events/domain/repositories`) + `IUnitOfWork` no construtor e envolvem cada caso de uso em `begin`/`commit`/`rollback`.
- A camada **infrastructure** implementa os mapeamentos MikroORM: cada entidade tem `XxxModel` + `XxxSchema` (EntitySchema) + `XxxMapper` (`toDomain`/`toModel`) em `mappers/`, e cada interface de repositório tem um concreto `MikroOrmXxxRepository` em `repositories/`.
- A conexão NestJS é feita fora do `@core`: controllers montam os services manualmente com os repositórios MikroORM e o `UnitOfWorkMikroOrm`, mantendo o `@core` sem acoplamento ao framework.

## Convenção de nomes

As entidades em `src/@core/events/domain/entities/` usam nomes em kebab-case simples, como `partner.ts`, `event.ts`, `customer.ts`, `order.ts` e `spot-reservation.ts`. `PartnerId` permanece em `partner-id.ts` para evitar dependência circular. Na infraestrutura, o padrão é `XxxModel` + `XxxSchema` + `XxxMapper` em `mappers/` e `MikroOrmXxxRepository` em `repositories/`.

## Comandos do desenvolvedor

| Comando | O que faz |
|---|---|
| `npm run build` | `nest build` — usa **SWC** (configurado em `nest-cli.json`, não `tsc`) |
| `npm run start:dev` | `nest start --watch` |
| `npm run lint` | ESLint em `src/`, `test/` — com `--fix` |
| `npm run format` | Prettier — `--write src/**/*.ts test/**/*.ts` |
| `npm test` | Jest em `src/` — busca `*.spec.ts` |
| `npm run test:cov` | Jest com cobertura |
| `npm run test:e2e` | Jest com `test/jest-e2e.json` — busca `*.e2e-spec.ts` |

## Convenções de teste

- **Testes unitários**: `*.spec.ts` dentro de `__tests__/` ou junto ao fonte.
- **Testes e2e**: `*.e2e-spec.ts` em `test/`.
- Testes importam de `@jest/globals` (`test`, `expect`) em vez de usar `describe`/`it` globais.
- **Descrições dos testes em português** (ex.: `'deve criar um evento'`).
- Config Jest no **`package.json`** (unitários) e **`test/jest-e2e.json`** (e2e).
- Testes unitários usam transform **ts-jest**; rootDir é `src`.
- `@mikro-orm/core` é ESM puro e precisa de **`moduleNameMapper`** apontando para `test/__mocks__/mikro-orm-core.ts` no Jest.

## Formatação e lint

- Prettier: `singleQuote: true`, `trailingComma: "all"`, `endOfLine: "auto"` (validade como erro no ESLint).
- ESLint: `typescript-eslint` recommended + plugin `prettier`. Regras alteradas: `no-explicit-any` desligado, `no-floating-promises` warn.
- Sem hooks de pre-commit ou workflows de CI configurados.

## Build

- `nest-cli.json`: builder SWC (`"builder": "swc"`), `deleteOutDir: true`.
- `tsconfig.build.json` extende `tsconfig.json`, exclui `node_modules`, `test`, `dist`, `*.spec.ts`.
- `tsconfig.json`: `module: nodenext`, `target: ES2023`, decorators habilitados, `strictNullChecks` ligado, `noImplicitAny` desligado.

## Ambiente

- `PORT` define a porta (padrão `3000`).
- Conexão MySQL via env vars (padrões): `DB_HOST` (`localhost`), `DB_PORT` (`3306`), `DB_USER` (`root`), `DB_PASSWORD` (vazio), `DB_NAME` (`mba_ddd`).
- `.env` e arquivos `.env.*` locais estão no `.gitignore`.
