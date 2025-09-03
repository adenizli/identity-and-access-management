/**
 * Returns a shallow copy of an object excluding keys with `undefined` values.
 *
 * @param obj - The source object
 * @returns New object without undefined properties
 */
export default function removeUndefinedProperties(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
}
