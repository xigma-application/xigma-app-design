// types
import { ColorFormat } from './enums';
import { TChannel } from './ChannelFields/types';

export const DEFAULT_FORMAT = ColorFormat.hex;

export const FORMAT_ORDER: ColorFormat[] = [ColorFormat.hex, ColorFormat.rgb, ColorFormat.css, ColorFormat.hsl, ColorFormat.hsb];

export const FORMAT_LABEL_KEY: Record<ColorFormat, string> = {
  [ColorFormat.css]: 'colorPicker.format.css',
  [ColorFormat.hex]: 'colorPicker.format.hex',
  [ColorFormat.hsb]: 'colorPicker.format.hsb',
  [ColorFormat.hsl]: 'colorPicker.format.hsl',
  [ColorFormat.rgb]: 'colorPicker.format.rgb',
};

export const RGB_CHANNELS: TChannel[] = [
  { key: 'r', max: 255 },
  { key: 'g', max: 255 },
  { key: 'b', max: 255 },
];

export const HSL_CHANNELS: TChannel[] = [
  { key: 'h', max: 360 },
  { key: 's', max: 100 },
  { key: 'l', max: 100 },
];

export const HSB_CHANNELS: TChannel[] = [
  { key: 'h', max: 360 },
  { key: 's', max: 100 },
  { key: 'v', max: 100 },
];
