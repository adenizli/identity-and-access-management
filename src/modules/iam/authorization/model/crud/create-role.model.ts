import { Permission } from '../../types/permission';

export class CreateRoleModel {
  title: string;
  color?: string;
  description?: string;
  includedPermissions?: Permission[];
  excludedPermissions?: Permission[];
}
