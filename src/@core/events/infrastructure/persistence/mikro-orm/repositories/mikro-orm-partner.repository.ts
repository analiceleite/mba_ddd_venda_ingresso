import { EntityManager } from '@mikro-orm/core';

import { PartnerId } from '../../../../domain/entities/partner-id';
import { Partner } from '../../../../domain/entities/partner';
import { PartnerRepository } from '../../../../domain/repositories';
import { PartnerMapper, PartnerModel } from '../mappers';

export class MikroOrmPartnerRepository implements PartnerRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async save(partner: Partner): Promise<void> {
    const model = await this.entityManager.findOne(PartnerModel, {
      id: partner.id.toString(),
    });

    this.entityManager.persist(PartnerMapper.toModel(partner, model ?? undefined));
    await this.entityManager.flush();
  }

  async findById(id: PartnerId): Promise<Partner | null> {
    const model = await this.entityManager.findOne(PartnerModel, {
      id: id.toString(),
    });

    return model ? PartnerMapper.toDomain(model) : null;
  }

  async findAll(): Promise<Partner[]> {
    const models = await this.entityManager.findAll(PartnerModel);
    return models.map((model) => PartnerMapper.toDomain(model));
  }

  async delete(id: PartnerId): Promise<void> {
    await this.entityManager.nativeDelete(PartnerModel, { id: id.toString() });
  }
}
