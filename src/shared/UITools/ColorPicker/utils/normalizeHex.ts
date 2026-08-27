const expandShorthand = (value: string): string =>
  value.length === 3
    ? value
        .split('')
        .map((char) => char + char)
        .join('')
    : value;

export const normalizeHex = (value: string): string => `#${expandShorthand(value.replace('#', '').toLowerCase())}`;
