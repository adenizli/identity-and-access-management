/**
 * Generates the current Unix timestamp in seconds.
 *
 * @returns Current Unix time (seconds)
 */
export default function generateUnixTime(): number {
  return Math.floor(Date.now() / 1000);
}
