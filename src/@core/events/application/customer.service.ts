import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { Customer } from '../domain/entities/customer';
import { CustomerRepository } from '../domain/repositories';

export class CustomerService {
  constructor(
    private customerRepo: CustomerRepository,
    private uow: IUnitOfWork,
  ) {}

  list() {
    return this.customerRepo.findAll();
  }

  async register(input: { name: string; cpf: string }) {
    await this.uow.begin();
    try {
      const customer = Customer.create(input);
      await this.customerRepo.save(customer);
      await this.uow.commit();
      return customer;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }
}
