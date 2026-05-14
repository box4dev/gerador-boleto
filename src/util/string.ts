export function onlyDigits(value: string | number): string {
  return String(value).replace(/\D/g, '');
}

export function zeroPad(value: string | number, length: number): string {
  return String(value).padStart(length, '0');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
