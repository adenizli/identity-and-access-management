import { BaseModel } from '@common/model/base.model';

import { EmailAddressModel } from '@common/model/contact.model';
import { PhoneModel } from '@common/model/contact.model';

export class UpdateUserModel extends BaseModel {
  firstName?: string;
  lastName?: string;
  email?: EmailAddressModel;
  phone?: PhoneModel;
  password?: string;
  roles?: string[];
  teams?: string[];
  includedPermissions?: string[];
  excludedPermissions?: string[];
  includedScopes?: string[];
  excludedScopes?: string[];
  administratorAccess?: boolean;
}
