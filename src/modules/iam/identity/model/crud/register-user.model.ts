import { EmailAddressModel, PhoneModel } from '@common/model/contact.model';
import { USER_TYPES } from '../../enum/user-types.enum';

export class RegisterUserModel {
  userType: USER_TYPES.CUSTOMER = USER_TYPES.CUSTOMER;
  firstName: string;
  lastName: string;
  email: EmailAddressModel;
  phone: PhoneModel;
  password: string;
}
