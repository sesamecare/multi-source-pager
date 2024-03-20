import { decode, encode } from 'universal-base64';

export function getCursorArray(encoded: string | undefined) {
  if (!encoded) {
    return [];
  }
  const decoded = decode(encoded);
  return JSON.parse(decoded);
}

export function toCursor(cursors: string[]) {
  return encode(JSON.stringify(cursors));
}
