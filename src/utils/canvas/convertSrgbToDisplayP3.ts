const srgbChannelToLinear = (channel: number): number => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);

const linearChannelToSrgb = (channel: number): number => (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055);

const SRGB_LINEAR_TO_P3_LINEAR = [
  [0.8224621, 0.177538, 0],
  [0.0331941, 0.9668058, 0],
  [0.0170827, 0.0723974, 0.9105199],
] as const;

export const convertSrgbToDisplayP3 = (r: number, g: number, b: number): [number, number, number] => {
  const linear = [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
  const [p3R, p3G, p3B] = SRGB_LINEAR_TO_P3_LINEAR.map((row) => row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2]);

  return [linearChannelToSrgb(p3R), linearChannelToSrgb(p3G), linearChannelToSrgb(p3B)];
};
