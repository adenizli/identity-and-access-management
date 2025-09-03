export const IDENTITY_PREFIX = 'iam.identity';
export const IDENTITY_PERMISSIONS = ['CREATE_USER', 'LIST_USERS', 'GET_USER', 'UPDATE_USER', 'DELETE_USER'] as const;
// Union type of the values in IDENTITY_PERMISSIONS
export type IdentityPermissions = (typeof IDENTITY_PERMISSIONS)[number];
