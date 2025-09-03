export const AUTHORIZATION_PREFIX = 'iam.authorization';
export const AUTHORIZATION_PERMISSIONS = ['CREATE_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE', 'GET_ROLE', 'LIST_ROLES'] as const;
// Union type of the values in AUTHORIZATION_PERMISSIONS
export type AuthorizationPermissions = (typeof AUTHORIZATION_PERMISSIONS)[number];
