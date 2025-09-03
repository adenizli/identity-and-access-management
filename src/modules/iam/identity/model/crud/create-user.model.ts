import { EmailAddressModel, PhoneModel } from '@common/model/contact.model';
import { USER_TYPES } from '../../enum/user-types.enum';

export class CreateUserModel {
  userType: USER_TYPES;
  firstName: string;
  lastName: string;
  username: string;
  email: EmailAddressModel;
  phone: PhoneModel;
  password?: string;
  roles?: string[] = [];
  teams?: string[] = [];
  includedPermissions?: string[] = [];
  excludedPermissions?: string[] = [];
  includedScopes?: string[] = [];
  excludedScopes?: string[] = [];
  administratorAccess?: boolean;
}
