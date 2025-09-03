import { Permission } from '../../types/permission';

export class UpdateRoleModel {
  title?: string;
  color?: string;
  description?: string;
  includedPermissions?: Permission[];
  excludedPermissions?: Permission[];
}
