// types
import { TAutoLayoutPaddingSide } from './types';

const PADDING_KEY_BY_SIDE = {
  bottom: 'paddingBottom',
  left: 'paddingLeft',
  right: 'paddingRight',
  top: 'paddingTop',
} as const;

export const getAutoLayoutPaddingKey = (side: TAutoLayoutPaddingSide): 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop' =>
  PADDING_KEY_BY_SIDE[side];
