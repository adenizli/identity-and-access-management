export abstract class ContactModel {
  isVerified?: boolean;
  verifiedAt?: number;
}

export class PhoneModel extends ContactModel {
  dialCode: string;
  number: string;

  static equals(phoneModel1: PhoneModel, phoneModel2: PhoneModel): boolean {
    return phoneModel1.dialCode === phoneModel2.dialCode && phoneModel1.number === phoneModel2.number;
  }
}

export class EmailAddressModel extends ContactModel {
  address: string;
}
