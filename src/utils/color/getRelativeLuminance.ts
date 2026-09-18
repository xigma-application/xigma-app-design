// types
import { TRgb } from 'types/color';

const linearizeChannel = (channel: number): number => {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

export const getRelativeLuminance = ({ b, g, r }: TRgb): number =>
  0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
