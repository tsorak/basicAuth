export function getTime(
  date: string | number | Date,
  currentDate: string | number | Date,
) {
  const sourceDate = new Date(date);
  const toDate = new Date(currentDate);

  const offset = toDate.getTimezoneOffset();

  const converted = offset < 0
    ? sourceDate.getTime() + 1000 * 60 * Math.abs(offset)
    : sourceDate.getTime() - 1000 * 60 * Math.abs(offset);

  return new Date(converted);
}
