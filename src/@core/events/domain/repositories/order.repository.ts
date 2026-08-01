import { Order, OrderId } from '../entities/order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}
