export function utcToday(): Date {
  const now = new Date();
  return normalizeDate(now);
}

export function normalizeDate(value: Date | string): Date {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Data inválida: ${value}`);
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
