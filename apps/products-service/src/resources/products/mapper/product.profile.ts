import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Product } from '@models/product.model';
import { GetProductDto } from '../dto/get-product.dto';

@Injectable()
export class ProductProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Product,
        GetProductDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.name),
        ),
        forMember(
          (dest) => dest.description,
          mapFrom((src) => src.description),
        ),
        forMember(
          (dest) => dest.price,
          mapFrom((src) => Number(src.price)),
        ),
        forMember(
          (dest) => dest.stock,
          mapFrom((src) => src.stock),
        ),
        forMember(
          (dest) => dest.isActive,
          mapFrom((src) => src.isActive),
        ),
        forMember(
          (dest) => dest.createdAt,
          mapFrom((src) => src.createdAt),
        ),
        forMember(
          (dest) => dest.updatedAt,
          mapFrom((src) => src.updatedAt),
        ),
      );
    };
  }
}
