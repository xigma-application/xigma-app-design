// types
import { TRgb } from 'types/color';

const toHexChannel = (channel: number): string => Math.round(channel).toString(16).padStart(2, '0');

export const rgbToHex = ({ b, g, r }: TRgb): string => `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
