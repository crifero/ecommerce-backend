import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Order } from '@models/order.model';
import { OrderItem } from '@models/order-item.model';
import { GetOrderDto, GetOrderItemDto } from '../dto/get-order.dto';

@Injectable()
export class OrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        OrderItem,
        GetOrderItemDto,
        forMember((d) => d.id, mapFrom((s) => s.id)),
        forMember((d) => d.productId, mapFrom((s) => s.productId)),
        forMember((d) => d.productName, mapFrom((s) => s.productName)),
        forMember((d) => d.productPrice, mapFrom((s) => Number(s.productPrice))),
        forMember((d) => d.quantity, mapFrom((s) => s.quantity)),
        forMember((d) => d.subtotal, mapFrom((s) => Number(s.subtotal))),
        forMember((d) => d.isActive, mapFrom((s) => s.isActive)),
        forMember((d) => d.wasDeleted, mapFrom((s) => s.wasDeleted)),
        forMember((d) => d.createdAt, mapFrom((s) => s.createdAt)),
        forMember((d) => d.updatedAt, mapFrom((s) => s.updatedAt)),
      );

      createMap(
        mapper,
        Order,
        GetOrderDto,
        forMember((d) => d.id, mapFrom((s) => s.id)),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status?.description ?? 'pending'),
        ),
        forMember((d) => d.total, mapFrom((s) => Number(s.total))),
        forMember((d) => d.observations, mapFrom((s) => s.observations)),
        forMember(
          (d) => d.items,
          mapFrom((s) =>
            s.items
              ? mapper.mapArray(s.items, OrderItem, GetOrderItemDto)
              : [],
          ),
        ),
        forMember((d) => d.createdAt, mapFrom((s) => s.createdAt)),
        forMember((d) => d.updatedAt, mapFrom((s) => s.updatedAt)),
      );
    };
  }
}
