import { defineConfig } from '@mikro-orm/mysql';

import {
  CustomerSchema,
  EventSchema,
  EventSectionSchema,
  EventSpotSchema,
  OrderSchema,
  PaymentSchema,
  PartnerSchema,
  SpotReservationSchema,
} from './@core/common/infrastructure/database/schemas';

const mikroOrmConfig = defineConfig({
  ensureDatabase: false,
  entities: [
    CustomerSchema,
    EventSchema,
    EventSectionSchema,
    EventSpotSchema,
    OrderSchema,
    PaymentSchema,
    PartnerSchema,
    SpotReservationSchema,
  ],
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'root',
  dbName: process.env.DB_NAME ?? 'mba_ddd',
});

export default mikroOrmConfig;
