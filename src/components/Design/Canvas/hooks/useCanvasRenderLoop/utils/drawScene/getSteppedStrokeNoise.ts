const smoothstep = (value: number): number => value * value * (3 - 2 * value);

export const getSteppedStrokeNoise = (values: number[], distance: number, wavelength: number, sharpness: number): number => {
  const position = distance / wavelength;
  const index = Math.floor(position);
  const t = position - index;
  const eased = smoothstep(Math.min(1, Math.max(0, (t - (1 - sharpness)) / sharpness)));
  const from = values[((index % values.length) + values.length) % values.length];
  const to = values[(((index + 1) % values.length) + values.length) % values.length];

  return from + (to - from) * eased;
};
