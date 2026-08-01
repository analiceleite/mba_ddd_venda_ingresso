import { Options } from '@mikro-orm/core';

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

const mikroOrmConfig: Options = {
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
  password: process.env.DB_PASSWORD ?? '',
  dbName: process.env.DB_NAME ?? 'mba_ddd',
  type: 'mysql',
};

export default mikroOrmConfig;
