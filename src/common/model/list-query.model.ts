export class ListQueryModel<T> {
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
  filter?: T;
}
