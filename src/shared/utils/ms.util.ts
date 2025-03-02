const timeUnits = new Map<string, number>([
  ['ms', 1],
  ['millisecond', 1],
  ['milliseconds', 1],
  ['s', 1000],
  ['sec', 1000],
  ['secs', 1000],
  ['second', 1000],
  ['seconds', 1000],
  ['m', 60000],
  ['min', 60000],
  ['mins', 60000],
  ['minute', 60000],
  ['minutes', 60000],
  ['h', 3600000],
  ['hr', 3600000],
  ['hrs', 3600000],
  ['hour', 3600000],
  ['hours', 3600000],
  ['d', 86400000],
  ['day', 86400000],
  ['days', 86400000],
  ['w', 604800000],
  ['week', 604800000],
  ['weeks', 604800000],
  ['y', 31557600000],
  ['yr', 31557600000],
  ['yrs', 31557600000],
  ['year', 31557600000],
  ['years', 31557600000]
]);

export function ms(input: string): number {
  if (typeof input !== 'string' || input.length === 0 || input.length > 100) {
    throw new Error('Value provided to ms() must be a string with length between 1 and 100.');
  }

  const match = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*(\w+)?$/i);
  if (!match) return NaN;

  const value = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase() ?? 'ms';

  if (!timeUnits.has(unit)) {
    throw new Error(`Error: The time unit "${unit}" is not recognized. Please check your input.`);
  }

  return value * timeUnits.get(unit)!;
}