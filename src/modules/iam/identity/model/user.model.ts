import { BaseModel } from '@common/model/base.model';
import { USER_TYPES } from '../enum/user-types.enum';
import { EmailAddressModel, PhoneModel } from '@common/model/contact.model';
import { RoleModel } from '@modules/iam/authorization/model';
import { Permission } from '@modules/iam/authorization/types/permission';

export class UserModel extends BaseModel {
  userType: USER_TYPES;
  firstName: string;
  lastName: string;
  username: string;
  email: EmailAddressModel;
  phone: PhoneModel;
  roles: string[];
  teams: string[];
  includedPermissions: string[];
  excludedPermissions: string[];
  includedScopes: string[];
  excludedScopes: string[];
  administratorAccess?: boolean;
}

export class UserAuthenticationCredentialsModel {
  id: string;
  email: EmailAddressModel;
  username: string;
  password: string;
  administratorAccess?: boolean;
}

export class UserAuthorizationCredentialsModel {
  roles?: RoleModel[];
  includedPermissions?: Set<Permission>;
  excludedPermissions?: Set<Permission>;
  administratorAccess?: boolean;
}
