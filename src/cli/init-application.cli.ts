import { Command, CommandRunner } from 'nest-commander';
import { IdentityService } from '@modules/iam/identity/identity.service';
import inquirer from 'inquirer';
import { CreateUserModel } from '@modules/iam/identity/model/crud/create-user.model';
import { USER_TYPES } from '@modules/iam/identity/enum/user-types.enum';

@Command({
  name: 'init-application',
  description: 'Initialize the application',
})
export class InitApplicationCommand extends CommandRunner {
  constructor(private readonly identityService: IdentityService) {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    console.log('🚀 Initializing application...\n');

    await this.createUserCli();

    process.exit(0);
  }

  private async createUserCli(): Promise<void> {
    interface UserCreationInfo {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
      phoneDialCode: string;
      phoneNumber: string;
    }
    const basicInfo = await inquirer.prompt<UserCreationInfo>([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter your first name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'First name is required!';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Only letters, numbers, hyphens and underscores allowed!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter your last name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Last name is required!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'username',
        message: 'Enter your username:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Username is required!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Email is required!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'password',
        message: 'Enter your password:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Password is required!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'confirmPassword',
        message: 'Confirm your password:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Confirm password is required!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'phoneDialCode',
        message: 'Enter your dial code (ie: +90 for Turkiye):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Dial code is required!';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'phoneNumber',
        message: 'Enter your phone number (ie: 5555555555):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Phone number is required!';
          }
          return true;
        },
      },
    ]);

    if (basicInfo.password !== basicInfo.confirmPassword) {
      console.log('🚨 Password and confirm password do not match!');
      console.log('❌ Please try again!');
      return;
    }

    console.log('⏳ Creating your user account, please wait...');

    const createUserModel = new CreateUserModel();
    createUserModel.userType = USER_TYPES.ADMIN;
    createUserModel.firstName = basicInfo.firstName;
    createUserModel.lastName = basicInfo.lastName;
    createUserModel.username = basicInfo.username;
    createUserModel.email = {
      address: basicInfo.email,
    };
    createUserModel.password = basicInfo.password;
    createUserModel.phone = {
      dialCode: basicInfo.phoneDialCode,
      number: basicInfo.phoneNumber,
    };

    try {
      const user = await this.identityService.createUser(createUserModel);
      console.log(`🚀 User ${user.username} created successfully`);
    } catch (error) {
      console.log('🚨 Error creating user:', error.message);
      console.log('❌ Please try again!');
      process.exit(0);
    }
  }
}
