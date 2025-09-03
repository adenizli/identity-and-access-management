import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailAddressModel, PhoneModel } from '@common/model/contact.model';

export class EmailDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  address: string;

  /**
   * Converts EmailDto to EmailAddressModel.
   *
   * @param dto - Email DTO
   * @returns Email address model
   */
  static toModel(dto: EmailDto): EmailAddressModel {
    const model = new EmailAddressModel();
    model.address = dto.address;
    return model;
  }
}

export class PhoneDto {
  @ApiProperty({
    description: 'Country dial code',
    example: '+1',
    pattern: '^\\+[1-9]\\d{0,3}$',
  })
  @IsString()
  @IsNotEmpty()
  dialCode: string;

  @ApiProperty({
    description: 'Phone number without country code',
    example: '5551234567',
    pattern: '^[0-9]{7,15}$',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  /**
   * Converts PhoneDto to PhoneModel.
   *
   * @param dto - Phone DTO
   * @returns Phone model
   */
  static toModel(dto: PhoneDto): PhoneModel {
    const model = new PhoneModel();
    model.dialCode = dto.dialCode;
    model.number = dto.number;
    return model;
  }
}
