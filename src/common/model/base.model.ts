export abstract class BaseModel {
  id: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
