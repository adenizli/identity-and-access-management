import { BaseModel } from '@common/model/base.model';
import { Permission } from '../types/permission';

export class RoleModel extends BaseModel {
  title: string;
  color: string;
  description?: string;
  includedPermissions?: Permission[];
  excludedPermissions?: Permission[];
}
