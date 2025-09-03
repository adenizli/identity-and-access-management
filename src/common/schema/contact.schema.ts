import { EmailAddressModel, PhoneModel } from '@common/model/contact.model';
import { Prop } from '@nestjs/mongoose';

export abstract class ContactSchema {
  @Prop({ required: false })
  isVerified?: boolean;

  @Prop({ required: false })
  verifiedAt?: number;
}

export class EmailAddressSchema extends ContactSchema {
  @Prop({ required: true })
  address: string;

  /**
   * Converts EmailAddressSchema document to EmailAddressModel.
   *
   * @param doc - Email address subdocument
   * @returns Email address model
   */
  static toModel(doc: EmailAddressSchema): EmailAddressModel {
    const model = new EmailAddressModel();
    model.address = doc.address;
    return model;
  }
}

export class PhoneSchema extends ContactSchema {
  @Prop({ required: true })
  dialCode: string;

  @Prop({ required: true })
  number: string;

  /**
   * Converts PhoneSchema document to PhoneModel.
   *
   * @param doc - Phone subdocument
   * @returns Phone model
   */
  static toModel(doc: PhoneSchema): PhoneModel {
    const model = new PhoneModel();
    model.dialCode = doc.dialCode;
    model.number = doc.number;
    return model;
  }
}
