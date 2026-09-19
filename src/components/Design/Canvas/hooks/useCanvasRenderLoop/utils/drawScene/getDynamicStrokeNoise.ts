const smoothstep = (value: number): number => value * value * (3 - 2 * value);

export const getDynamicStrokeNoise = (values: number[], distance: number, wavelength: number, smoothen: number): number => {
  const position = distance / wavelength;
  const index = Math.floor(position);
  const t = position - index;
  const eased = t + (smoothstep(t) - t) * smoothen;
  const from = values[((index % values.length) + values.length) % values.length];
  const to = values[(((index + 1) % values.length) + values.length) % values.length];

  return from + (to - from) * eased;
};
