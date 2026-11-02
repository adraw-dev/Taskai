import { format, parseISO } from "date-fns";

// Las columnas `date` de Postgres son fechas de calendario sin zona horaria.
// `toISOString()` y `new Date("yyyy-MM-dd")` trabajan en UTC, lo que corre la
// fecha un día en zonas como America/Bogota; estas funciones usan hora local.

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayDateString(): string {
  return toDateString(new Date());
}

export function parseDateString(value: string): Date {
  return parseISO(value);
}
