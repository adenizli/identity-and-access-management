import { UserModel } from '../model/user.model';

/**
 * Generates a simple HTML email for user registration.
 *
 * @param user - Newly registered user
 * @param unHashedPassword - Plain password generated for the user
 * @returns HTML content as string
 */
export const UserRegistrationEmailTemplate = (user: UserModel, unHashedPassword: string) => {
  return `
    <h1>Welcome to our platform</h1>
    <p>Your email is: ${user.email}</p>
    <p>Your password is: ${unHashedPassword}</p>
  `;
};
