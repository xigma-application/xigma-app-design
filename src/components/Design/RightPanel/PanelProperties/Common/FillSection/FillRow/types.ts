// types
import { TContrastUnsupportedReason } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/types';

export type TContrastBackground = { color: string; reason?: undefined } | { color?: undefined; reason: TContrastUnsupportedReason };

export type TBackgroundFillLayer =
  | { kind: 'none' }
  | { kind: 'solid'; alpha: number; color: string }
  | { kind: 'unsupported'; reason: TContrastUnsupportedReason };
