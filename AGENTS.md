# AGENTS.md — mba-ddd-venda-ingresso

## Estrutura do projeto

NestJS com camada de domínio DDD isolada em `src/@core/`.  
O `AppModule` do NestJS ainda é o scaffold padrão e **não está conectado** ao `@core` — essa ligação precisa ser construída.

```
src/
  main.ts                         # Bootstrap NestJS (PORT env, padrão 3000)
  app.module.ts                   # Módulo raiz NestJS — NÃO importa @core
  @core/                          # Camada de domínio pura (sem decorators/DI do NestJS)
    common/domain/                # Classes base: Entity, AggregateRoot, ValueObject
      value-objects/              # Uuid, Cpf, Name, MyCollectionFactory (proxy MikroORM)
    common/application/           # vazio
    common/infrastructure/        # vazio
    events/domain/entities/       # Event, Partner, EventSection, EventSpot, Customer
      __tests__/                  # Testes unitários (*.spec.ts)
      partner-id.ts               # PartnerId extraído para quebrar dependência circular
    events/application/           # vazio
    events/infrastructure/        # vazio
test/
  __mocks__/mikro-orm-core.ts     # Mock manual de @mikro-orm/core para Jest
```

## Fatos de arquitetura

- **`@core/` é TypeScript puro** — sem decorators NestJS, sem DI, sem acoplamento com o framework.
- Apenas a camada **domain** tem código. `application/` e `infrastructure/` são escopo vazio.
- Hierarquia: `ValueObject` → `Uuid / Cpf / Name`, `Entity` → `AggregateRoot`, `AggregateRoot` → `Event / Partner / Customer`.
- Entidades usam **factory static `create()`** + `constructor` que aceita tanto IDs do domínio quanto strings.
- Value objects **validam na construção** e lançam erros de domínio (`InvalidCpfError`, `InvalidUuidError`).
- `MyCollectionFactory` é um **Proxy** sobre a `Collection` do MikroORM — usado em `EventSection` e `Event` para gerenciar coleções de filhos.
- Comportamentos de domínio usam métodos nomeados com intenção de negócio (`changeName`, `publish`, `publishAll`) em vez de setters genéricos ou `update`.
- Agregado `Event` é raiz que contém `EventSection` (sessions), que contém `EventSpot` (spots). `Event.publishAll()` propaga em cascata.
- `Partner.initEvent(command)` cria um `Event` usando o próprio ID do partner — evita montagem externa do `partner_id`.

## Convenção de nomes

As entidades em `src/@core/events/domain/entities/` usam nomes em kebab-case simples, como `partner.ts`, `event.ts` e `customer.ts`. `PartnerId` permanece em `partner-id.ts` para evitar dependência circular.

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
- `.env` e arquivos `.env.*` locais estão no `.gitignore`.
