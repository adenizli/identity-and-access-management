import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ListQueryModel } from '../model/list-query.model';
import { Type } from 'class-transformer';

export class ListQueryDto<T> {
  @IsNotEmpty()
  @Type(() => Number)
  limit: number;

  @IsNotEmpty()
  @Type(() => Number)
  offset: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  filter?: T;

  /**
   * Converts a ListQueryDto into a ListQueryModel by normalizing values.
   *
   * @param dto - Incoming request query DTO
   * @returns A normalized list query model
   */
  static toModel<T>(dto: ListQueryDto<T>): ListQueryModel<T> {
    const model = new ListQueryModel<T>();
    model.limit = dto.limit == 0 ? undefined : dto.limit;
    model.offset = dto.offset == 0 ? undefined : dto.offset;
    model.sort = dto.sort;
    model.search = dto.search;
    model.filter = dto.filter;
    return model;
  }
}
