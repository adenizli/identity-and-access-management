import { Injectable } from '@nestjs/common';
import { EmailModel } from './model/email.model';

@Injectable()
export class CommunicationService {
  constructor() {}

  /**
   * Sends an email using the provided email model.
   *
   * Note: Currently simulated with console logs.
   *
   * @param emailModel - Email payload including to, subject, body and optional from
   */
  async sendEmail(emailModel: EmailModel): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Sends an SMS message to a phone number.
   *
   * Note: Currently simulated with console logs.
   *
   * @param phoneNumber - Target phone number in E.164 or local format
   * @param message - Message content
   */
  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    console.log('📱 Sending SMS:', {
      to: phoneNumber,
      message: message,
    });

    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('✅ SMS sent successfully');
  }
}
