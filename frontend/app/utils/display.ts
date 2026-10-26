export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

export function formatPeriod(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function displayError(error: unknown): string {
  return error instanceof Error ? error.message : "Der opstod en uventet fejl.";
}
