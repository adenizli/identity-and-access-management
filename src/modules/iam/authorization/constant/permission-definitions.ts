import { AUTHORIZATION_PERMISSIONS, AUTHORIZATION_PREFIX } from '../config/auth.permissions';
import { IDENTITY_PERMISSIONS, IDENTITY_PREFIX } from '../config/identity.permissions';
import { PermissionModel } from '../model/permission.model';

const PERMISSION_CONFIG = [
  {
    prefix: AUTHORIZATION_PREFIX,
    permissions: AUTHORIZATION_PERMISSIONS,
  },
  {
    prefix: IDENTITY_PREFIX,
    permissions: IDENTITY_PERMISSIONS,
  },
];

export const PERMISSON_DEFINITIONS: Record<string, PermissionModel[]> = {
  ...PERMISSION_CONFIG.reduce(
    (acc, { prefix, permissions }) => {
      acc[prefix] = permissions.map((permission) => ({
        title: `${prefix}.${permission}`,
        code: permission,
      }));
      return acc;
    },
    {} as Record<string, PermissionModel[]>,
  ),
};

export const PERMISSIONS_ARRAY = [...AUTHORIZATION_PERMISSIONS];
