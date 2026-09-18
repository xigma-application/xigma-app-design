// types
import { TStrokeSide } from './types';

export const STROKE_SIDES: TStrokeSide[] = ['left', 'top', 'right', 'bottom'];

export const STROKE_SIDE_WIDTH_KEYS = {
  bottom: 'strokeBottomWidth',
  left: 'strokeLeftWidth',
  right: 'strokeRightWidth',
  top: 'strokeTopWidth',
} as const;
