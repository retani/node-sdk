// Convert a date string to a Javascript Date object
export function stringToDate(s: string): Date {
  return new Date(Date.parse(s))
}
