# MBA DDD Venda de Ingresso

API backend para reserva e venda de ingressos, construída como estudo prático de **Domain-Driven Design**, **Clean Architecture**, persistência com **MikroORM/MySQL** e publicação assíncrona de eventos com **Outbox Pattern + RabbitMQ**.

O objetivo do projeto é demonstrar uma aplicação NestJS onde o framework fica na borda e o domínio permanece isolado, testável e independente de infraestrutura.

## O Que Este Projeto Demonstra

- Modelagem de domínio rico com agregados, entidades e value objects.
- Separação entre domínio, aplicação, infraestrutura e apresentação.
- Regras de negócio dentro do domínio, não em controllers.
- Use cases transacionais com Unit of Work.
- Repositórios por contrato, com implementação MikroORM.
- Persistência de agregados com mappers entre modelo de banco e domínio.
- Eventos de domínio (`OrderConfirmed`, `PaymentPaid`).
- Outbox Pattern para publicação confiável de eventos.
- Integração com RabbitMQ via exchange `domain_events`.
- Testes unitários para entidades, value objects, services e outbox.

## Domínio

O sistema representa um fluxo simplificado de venda de ingressos:

1. Um **partner** cria eventos.
2. Um **event** possui setores/sections.
3. Cada section gera seus próprios spots/assentos.
4. Um **customer** pode reservar um spot publicado e disponível.
5. A reserva cria um **order** pendente.
6. Um pagamento é processado.
7. Se aprovado, o pagamento é marcado como pago e o pedido é confirmado.
8. Eventos de domínio são gravados no outbox e publicados no RabbitMQ.

## Agregados e Entidades

- **Partner**: organizador responsável por iniciar eventos.
- **Event**: agregado raiz de evento, com sections e spots.
- **EventSection**: setor/lote com preço, quantidade de spots e regras de reserva.
- **EventSpot**: unidade reservável dentro de uma section.
- **Customer**: comprador identificado por nome e CPF.
- **Order**: agregado de pedido, com status `pending`, `confirmed` ou `cancelled`.
- **SpotReservation**: reserva de um spot dentro do pedido.
- **Payment**: pagamento do pedido, com método `pix` ou `card` e status `pending`, `paid` ou `failed`.
- **OutboxMessage**: mensagem persistida para publicação assíncrona de eventos.

## Stack

- **Node.js + TypeScript**
- **NestJS 11** como camada de apresentação/bootstrap
- **MikroORM 7** com MySQL
- **MySQL 8** via Docker Compose
- **RabbitMQ** com Management UI
- **Jest + ts-jest** para testes
- **SWC** no build NestJS
- **ESLint + Prettier**

## Arquitetura

```text
src/
  main.ts
  app.module.ts
  mikro-orm.config.ts

  presentation/
    customers.controller.ts
    events.controller.ts
    partners.controller.ts

  orders/
    orders.controller.ts
    orders.module.ts

  messaging/
    messaging.module.ts
    outbox-poller.service.ts
    message-broker.provider.ts
    queue-setup.service.ts

  @core/
    common/
      domain/
        entity.ts
        aggregate-root.ts
        value-objects/
      application/
        unit-of-work.interface.ts
        message-broker.interface.ts
      infra/
        unit-of-work-mikro-orm.ts
      infrastructure/database/
        schemas.ts
      outbox/
        outbox-message.ts
        outbox-relay.ts
        outbox-repository.interface.ts

    events/
      domain/
        entities/
        repositories/
        domain-events/
      application/
        customer.service.ts
        event.service.ts
        order.service.ts
        partner.service.ts
        payment.gateway.ts
      infrastructure/
        gateways/
        message-broker/
        persistence/mikro-orm/
          mappers/
          repositories/
```

## Camadas

### Domain

Contém regras e invariantes de negócio. Não depende de NestJS, MikroORM, RabbitMQ ou banco.

Exemplos:

- `EventSection.allowReserveSpot()` valida se o setor e o spot estão publicados e disponíveis.
- `EventSection.markSpotAsReserved()` altera o estado do spot e incrementa o total reservado.
- `Order.confirm()` só permite confirmar pedidos pendentes e dispara `OrderConfirmed`.
- `Payment.markAsPaid()` só liquida pagamentos pendentes e dispara `PaymentPaid`.
- `Cpf`, `Name` e `Uuid` validam dados na construção.

### Application

Orquestra casos de uso usando contratos de repositório, gateway de pagamento e Unit of Work.

O principal fluxo está em `OrderService.reserve()`:

1. Carrega evento e customer.
2. Localiza section e spot.
3. Valida disponibilidade.
4. Marca spot como reservado.
5. Cria order e payment.
6. Processa pagamento.
7. Confirma order e payment.
8. Persiste order, payment e event na mesma transação.
9. Converte eventos de domínio em mensagens de outbox.

### Infrastructure

Implementa persistência, mappers, gateway fake de pagamento, Unit of Work MikroORM e broker RabbitMQ.

Cada entidade persistida tem:

- `XxxModel`
- `XxxSchema`
- `XxxMapper`
- `MikroOrmXxxRepository`

### Presentation

Controllers NestJS expõem HTTP e montam os use cases com implementações concretas.

O `@core` não conhece controllers, decorators ou dependency injection do NestJS.

## Outbox Pattern

Quando uma reserva é confirmada, os eventos de domínio são armazenados como `OutboxMessage` na mesma transação da alteração de estado.

O `OutboxPollerService` roda periodicamente e chama `OutboxRelay.dispatchPending()`, que:

1. Busca mensagens pendentes.
2. Publica no RabbitMQ usando a exchange `domain_events`.
3. Marca as mensagens como publicadas.

Configurações:

```env
RABBITMQ_URL=amqp://localhost:5672
OUTBOX_POLL_INTERVAL_MS=5000
OUTBOX_BATCH_SIZE=10
```

## Endpoints

Base URL local: `http://localhost:3000`

### Customers

```http
POST /customers
GET /customers
PUT /customers/:id
```

Payload de criação:

```json
{
  "name": "John Doe",
  "cpf": "52998224725"
}
```

### Partners

```http
POST /partners
GET /partners
PUT /partners/:id
```

Payload de criação:

```json
{
  "name": "Partner A"
}
```

### Events

```http
POST /events
GET /events
GET /events/:id
PUT /events/:id
POST /events/:id/publish
POST /events/:id/unpublish
POST /events/:id/publish-all
POST /events/:id/sections
```

Payload de criação de evento:

```json
{
  "name": "Show do Foo Fighters",
  "description": "Show na cidade",
  "date": "2026-12-10T20:00:00.000Z",
  "partner_id": "partner-uuid"
}
```

Payload de criação de section:

```json
{
  "name": "Pista",
  "description": "Setor principal",
  "total_spots": 10,
  "price": 150
}
```

### Orders

```http
POST /orders/reserve
GET /orders
GET /orders/:id
```

Payload de reserva:

```json
{
  "customer_id": "customer-uuid",
  "event_id": "event-uuid",
  "section_id": "section-uuid",
  "spot_id": "spot-uuid",
  "payment_method": "pix"
}
```

Também existe o arquivo `api.http` com exemplos prontos para clientes REST compatíveis.

## Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm

### Instalação

```bash
npm install
```

### Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Variáveis disponíveis:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=mba_ddd

RABBITMQ_URL=amqp://localhost:5672
OUTBOX_POLL_INTERVAL_MS=5000
OUTBOX_BATCH_SIZE=10
```

### Subir Infraestrutura

```bash
npm run db:up
```

Isso inicia:

- MySQL em `localhost:3306`
- RabbitMQ em `localhost:5672`
- RabbitMQ Management UI em `http://localhost:15672` (`guest` / `guest`)

### Criar/Atualizar Schema

```bash
npm run db:schema:update
```

Ou usando migrações:

```bash
npm run db:migration:create
npm run db:migration:up
```

### Executar API

```bash
npm run start:dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run start` | Inicia a aplicação NestJS |
| `npm run start:dev` | Inicia em modo watch |
| `npm run build` | Build com Nest/SWC |
| `npm run start:prod` | Executa `dist/main` |
| `npm run db:up` | Sobe MySQL e RabbitMQ |
| `npm run db:down` | Remove containers |
| `npm run db:schema:update` | Sincroniza schema via MikroORM |
| `npm run db:migration:create` | Cria migration MikroORM |
| `npm run db:migration:up` | Executa migrations MikroORM |
| `npm test` | Roda testes unitários |
| `npm run test:cov` | Roda testes com cobertura |
| `npm run test:e2e` | Roda testes e2e |
| `npm run lint` | ESLint com autofix |
| `npm run format` | Prettier |

## Testes

Os testes cobrem regras de domínio e serviços de aplicação, incluindo:

- Value Objects (`Cpf`, `Name`, `Uuid`).
- Agregados (`Event`, `Order`, `Payment`, `Customer`).
- Fluxo de reserva em `OrderService`.
- Eventos de domínio em `AggregateRoot`.
- Outbox messages e relay.
- Schemas/mappers de persistência.

Rodar todos os testes:

```bash
npm test
```

Rodar com cobertura:

```bash
npm run test:cov
```

## Decisões de Design

- **Domínio isolado**: `src/@core` não depende de NestJS.
- **Controllers finos**: HTTP apenas traduz entrada e chama services.
- **UoW explícito**: casos de uso transacionais recebem `IUnitOfWork`.
- **Mappers dedicados**: domínio não é contaminado por modelos ORM.
- **Outbox**: eventos são publicados fora da transação principal, mas gravados junto da mudança de estado.
- **Gateway fake de pagamento**: permite testar o fluxo sem provedor externo.
- **Request scope nos controllers**: cada request recebe seu `EntityManager` e repositórios concretos.

## Próximas Melhorias Possíveis

- DTOs com validação usando `class-validator` ou Zod.
- Autenticação/autorização para endpoints administrativos.
- Tratamento padronizado de erros de domínio.
- Migrations versionadas no repositório.
- Testes e2e cobrindo fluxo completo HTTP.
- Substituir `FakePaymentGateway` por integração real.
- Consumidores reais para os eventos publicados no RabbitMQ.

## Licença

Projeto privado/educacional, sem licença pública definida.
