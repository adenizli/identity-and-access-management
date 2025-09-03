/**
 * Generates a random positive integer with the specified number of digits.
 *
 * @param length - Desired number of digits
 * @returns A random integer with the specified length
 */
export const generateRandomNumber = (length: number) => {
  return Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1));
};
