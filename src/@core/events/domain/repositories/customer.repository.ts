import { Customer, CustomerId } from '../entities/customer';

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  delete(id: CustomerId): Promise<void>;
}
