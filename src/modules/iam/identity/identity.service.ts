import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserRepositoryService } from './repository/user-repository.service';
import { UserAuthorizationCredentialsModel, UserAuthenticationCredentialsModel, UserModel } from './model/user.model';
import { CreateUserModel } from './model/crud/create-user.model';
import { UpdateUserModel } from './model/crud/update-user.model';
import { CommunicationService } from '../../communication/communication.service';
import * as bcrypt from 'bcrypt';
import { generateRandomNumber } from '@common/utility/generate-random-number';
import { UserRegistrationEmailTemplate } from './templates/user-registration-email-template';
import { EmailModel } from '@modules/communication/model/email.model';
import { ConfigService } from '@nestjs/config';
import { USER_TYPES } from './enum/user-types.enum';
import { ListQueryModel } from '@common/model/list-query.model';
import { ListResponseModel } from '@common/model/list-response.model';
import { PhoneModel } from '@common/model/contact.model';
import { AuthorizationService } from '../authorization/authorization.service';

@Injectable()
export class IdentityService {
  constructor(
    private readonly userRepositoryService: UserRepositoryService,
    private readonly communicationService: CommunicationService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthorizationService)) private readonly authorizationService: AuthorizationService,
  ) {}

  /**
   * Creates a new user account in the system.
   *
   * Workflow:
   * 1. Validates that the username and email are unique.
   * 2. If no password is provided, generates a temporary one.
   * 3. Hashes the password before persisting.
   * 4. Creates the user record in the database.
   * 5. Sends a welcome email (asynchronously), including the temporary password if one was generated.
   *
   * @param createUserModel - The input model containing user creation data.
   * @returns The created user model.
   * @throws HttpException if the username or email already exists.
   */
  /**
   * Creates a user with uniqueness checks and welcome email.
   *
   * @param createUserModel - User creation model
   * @returns Created user model
   * @throws HttpException on username/email conflicts
   */
  async createUser(createUserModel: CreateUserModel): Promise<UserModel> {
    // ============ 1- CHECK USERNAME EXISTANCE ============
    const existingUser = await this.userRepositoryService.findUserByUsername(createUserModel.username);
    if (existingUser) throw new HttpException('USERNAME_ALREADY_EXISTS', HttpStatus.CONFLICT);

    // ============= 2- CHECK EMAIL EXISTANCE ==============
    const existingEmail = await this.userRepositoryService.findUserByEmail(createUserModel.email.address);
    if (existingEmail) throw new HttpException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
    // ============= 3- CHECK PHONE EXISTANCE ==============
    const existingPhone = await this.userRepositoryService.findUserByPhoneNumber(createUserModel.phone);
    if (existingPhone) throw new HttpException('PHONE_ALREADY_EXISTS', HttpStatus.CONFLICT);
    // ================= 4- HASH PASSWORD ==================
    const { hashedPassword, generatedPassword } = await this.hashPassword(createUserModel.password);
    createUserModel.password = hashedPassword;
    // ============= 5- VALIDATE ROLES ==============
    const roleExistance = await Promise.all(createUserModel.roles.map((roleId) => this.authorizationService.doesRoleExist(roleId)));
    if (roleExistance.some((exists) => !exists)) throw new HttpException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);
    // ============= 6- CREATE USER DOCUMENT ==============
    const userModel = await this.userRepositoryService.createUser(createUserModel);
    // ============= 7- SEND WELCOME MAIL TO USER ==============
    const welcomeMailModel = await this.generateWelcomeMail(userModel, generatedPassword);
    // we kept it as async because we want to send the mail asynchronously
    this.communicationService.sendEmail(welcomeMailModel);
    return userModel;
  }

  /**
   * Updates an existing user account in the system.
   *
   * Workflow:
   * 1. Validates that the user exists.
   * 2. Checks if the email is being changed and verifies it's not already in use.
   * 3. Checks if the phone is being changed and verifies it's not already in use.
   * 4. Updates the user document in the database.
   *
   * @param id - The ID of the user to update.
   * @param updateUserModel - The input model containing user update data.
   * @returns The updated user model.
   * @throws HttpException if the user does not exist or the email/phone is already in use.
   */
  /**
   * Updates an existing user with validation for email uniqueness on change.
   *
   * @param id - User identifier
   * @param updateUserModel - Partial update model
   * @returns Updated user model
   * @throws HttpException when user not found or email conflict
   */
  async updateUser(id: string, updateUserModel: UpdateUserModel): Promise<UserModel> {
    // ============= 1- CHECK USER EXISTANCE ==============
    const existingUserModel = await this.userRepositoryService.findUserById(id);
    if (!existingUserModel) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    // ============= 2- CHECK IF EMAIL IS CHANGED ==============
    if (updateUserModel.email && updateUserModel.email.address !== existingUserModel.email.address) {
      const existingEmail = await this.userRepositoryService.findUserByEmail(updateUserModel.email.address);
      if (existingEmail) throw new HttpException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    // ============= 3- CHECK IF PHONE IS CHANGED ==============
    if (updateUserModel.phone && !PhoneModel.equals(updateUserModel.phone, existingUserModel.phone)) {
      const existingPhone = await this.userRepositoryService.findUserByPhoneNumber(updateUserModel.phone);
      if (existingPhone) throw new HttpException('PHONE_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    // ============= 4- VALIDATE ROLES ==============
    if (updateUserModel.roles && updateUserModel.roles.length > 0) {
      const roleExistence = await Promise.all(updateUserModel.roles.map((roleId) => this.authorizationService.doesRoleExist(roleId)));
      if (roleExistence.some((exists) => !exists)) throw new HttpException('ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // ============= 5- UPDATE DOCUMENT ==============
    return this.userRepositoryService.updateUser(id, updateUserModel);
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @param id - The ID of the user to retrieve.
   * @returns The user model.
   * @throws HttpException if the user does not exist.
   */
  /**
   * Fetches a user by id.
   *
   * @param id - User identifier
   * @returns User model
   * @throws HttpException when user not found
   */
  async getUserById(id: string): Promise<UserModel> {
    const userModel = await this.userRepositoryService.findUserById(id);
    if (!userModel) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    return userModel;
  }

  /**
   * Lists users for a given type with pagination.
   *
   * @param userType - Filter by user type
   * @param listQueryModel - Pagination/sort options
   * @returns Paginated list response
   */
  async listUsers(userType: USER_TYPES, listQueryModel: ListQueryModel<UserModel>): Promise<ListResponseModel<UserModel>> {
    const users = await this.userRepositoryService.findUsers(userType, listQueryModel);
    const total = await this.userRepositoryService.countUsers(userType, listQueryModel);

    const listResponseModel = new ListResponseModel<UserModel>();
    listResponseModel.data = users;
    listResponseModel.total = total;
    return listResponseModel;
  }

  /**
   * Retrieves user authentication credentials by identifier (username or email).
   *
   * @param identifier - Username or email address
   * @returns Authentication credentials model
   * @throws HttpException when not found
   */
  async getUserByCredentials(identifier: string): Promise<UserAuthenticationCredentialsModel> {
    const userCredentialsModel = await this.userRepositoryService.findUserByCredentials(identifier);
    if (!userCredentialsModel) throw new HttpException('INVALID_CREDENTIALS', HttpStatus.NOT_FOUND);
    return userCredentialsModel;
  }

  /* ========================================= */
  /* ============ UTILITY METHODS ============ */
  /* ========================================= */

  /**
   * Generates a welcome email for a new user.
   *
   * @param userModel - The user model to send the email to.
   * @param generatedPassword - The generated password for the user.
   * @returns The email model.
   */
  /**
   * Builds a welcome email payload for the newly created user.
   *
   * @param userModel - Created user
   * @param generatedPassword - Optional generated password to include
   * @returns Email model ready for sending
   */
  private async generateWelcomeMail(userModel: UserModel, generatedPassword: string): Promise<EmailModel> {
    const welcomeMailModel = new EmailModel();
    welcomeMailModel.to = userModel.email.address;
    welcomeMailModel.subject = 'Welcome to our platform';
    welcomeMailModel.body = generatedPassword ? UserRegistrationEmailTemplate(userModel, generatedPassword) : 'kaydoldunuz';
    return welcomeMailModel;
  }

  /**
   * Hashes the provided password or generates a temporary one if none is given.
   *
   * - If a password is provided, it will be hashed using bcrypt.
   * - If no password is provided, a 6-digit numeric password is generated,
   *   then hashed, and both versions are returned.
   *
   * @param password - The plain-text password to hash. Can be null or empty.
   * @returns An object containing:
   *   - `hashedPassword`: The bcrypt-hashed password.
   *   - `generatedPassword`: The plain-text generated password if one was created, otherwise `null`.
   */
  /**
   * Hashes a password or generates a temporary one in dev/prod as configured.
   *
   * @param password - Optional plain password provided by user/admin
   * @returns Object containing hashed password and any generated plain password
   */
  private async hashPassword(password?: string): Promise<{ hashedPassword: string; generatedPassword: string }> {
    let generatedPassword: string;
    if (!password) {
      if (process.env.NODE_ENV === 'production') generatedPassword = generateRandomNumber(6).toString();
      else generatedPassword = this.configService.get('DEVELOPMENT_DEFAULT_USER_PASSWORD');
    }

    const bcryptRounds = Number(this.configService.get('BCRYPT_ROUNDS') || 10);
    const hashedPassword = await bcrypt.hash(password || generatedPassword, bcryptRounds);
    return { hashedPassword, generatedPassword };
  }

  /**
   * Fetches user authorization credentials including roles and permissions.
   *
   * @param userId - User identifier
   * @returns Authorization credentials model
   * @throws HttpException when user not found
   */
  public async getUserAuthorizationCredentials(userId: string): Promise<UserAuthorizationCredentialsModel> {
    const userAuthorizationCredentialsModel = await this.userRepositoryService.findUserAuthorizationCredentialsById(userId);
    if (!userAuthorizationCredentialsModel) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    return userAuthorizationCredentialsModel;
  }

  /**
   * Fetches users by role id.
   *
   * @param roleId - Role identifier
   * @returns User models
   */
  public async getUsersByRoleId(roleId: string): Promise<UserModel[]> {
    return await this.userRepositoryService.findUsersByRoleId(roleId);
  }
}
