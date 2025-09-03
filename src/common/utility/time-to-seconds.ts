/**
 * Converts time duration strings to seconds
 *
 * Supported units:
 * - s: seconds
 * - m: minutes
 * - h: hours
 * - d: days
 * - w: weeks
 *
 * @param timeString - Time string like "3m", "2h 30m", "1d 5h 30m 15s"
 * @returns Total time in seconds
 *
 * @example
 * timeToSeconds("3m") // returns 180
 * timeToSeconds("2h 30m") // returns 9000
 * timeToSeconds("1d 2h 30m 15s") // returns 95415
 */
export function timeToSeconds(timeString: string): number {
  if (!timeString || typeof timeString !== 'string') {
    throw new Error('Invalid time string provided');
  }

  const timeUnits = {
    s: 1, // seconds
    m: 60, // minutes
    h: 3600, // hours
    d: 86400, // days
    w: 604800, // weeks
  };

  // Remove extra whitespace and convert to lowercase
  const cleanedString = timeString.trim().toLowerCase();

  // Match patterns like "3m", "2h", "30s" with optional whitespace
  const timePattern = /(\d+(?:\.\d+)?)\s*([smhdw])/g;
  const matches = [...cleanedString.matchAll(timePattern)];

  if (matches.length === 0) {
    throw new Error(`Invalid time format: ${timeString}. Use formats like "3m", "2h 30m", "1d 5h 30m 15s"`);
  }

  let totalSeconds = 0;
  const usedUnits = new Set<string>();

  for (const match of matches) {
    const value = parseFloat(match[1]);
    const unit = match[2] as keyof typeof timeUnits;

    if (isNaN(value) || value < 0) {
      throw new Error(`Invalid time value: ${match[1]}`);
    }

    if (usedUnits.has(unit)) {
      throw new Error(`Duplicate time unit: ${unit}`);
    }

    usedUnits.add(unit);
    totalSeconds += value * timeUnits[unit];
  }

  return Math.floor(totalSeconds);
}
