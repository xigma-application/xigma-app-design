export const hexToRgbFloat = (hex: string): [number, number, number] => {
  const value = hex.replace('#', '');

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  return [r, g, b];
};
