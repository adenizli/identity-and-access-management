import type { AuthorizationPermissions } from '../config/auth.permissions';
import { IdentityPermissions } from '../config/identity.permissions';

export type Permission = AuthorizationPermissions | IdentityPermissions;
