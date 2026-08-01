import { IUnitOfWork } from '../../common/application/unit-of-work.interface';
import { PartnerRepository } from '../domain/repositories';
import { Partner } from '../domain/entities/partner';
import { PartnerId } from '../domain/entities/partner-id';

export class PartnerService {
  constructor(
    private partnerRepo: PartnerRepository,
    private uow: IUnitOfWork,
  ) {}

  list() {
    return this.partnerRepo.findAll();
  }

  async create(input: { name: string }) {
    await this.uow.begin();

    try {
      const partner = Partner.create(input);
      await this.partnerRepo.save(partner);
      await this.uow.commit();
      return partner;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }

  async update(id: PartnerId, input: { name: string }) {
    try {
      await this.uow.begin();
      const partner = await this.partnerRepo.findById(id);

      if (!partner) {
        console.log('Parceiro não encontradado');
        await this.uow.rollback();
        return;
      }

      partner.changeName(input.name);
      await this.partnerRepo.save(partner);
      await this.uow.commit();
      return partner;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }
}
