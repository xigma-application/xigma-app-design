const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isValidHex = (value: string): boolean => HEX_PATTERN.test(value);
