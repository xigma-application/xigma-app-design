// types
import { StrokeProfile } from 'types/design/enums';
import { TIconProps } from '@xigma/components';

export const STROKE_STYLES = ['solid', 'dashed', 'custom'] as const;

export type TStrokeStyle = (typeof STROKE_STYLES)[number];

export const STROKE_STYLE_ICONS: Partial<Record<TStrokeStyle, TIconProps['name']>> = {
  dashed: 'StrokeDashed',
  solid: 'StrokeSolid',
};

export const STROKE_STYLE_ICON_SIZE = 24;

export const STROKE_STYLE_MENU_WIDTH_PX = 144;

export const STROKE_JOINS = ['miter', 'bevel', 'round'] as const;

export type TStrokeJoin = (typeof STROKE_JOINS)[number];

export const STROKE_JOIN_ICONS: Record<TStrokeJoin, TIconProps['name']> = {
  bevel: 'StrokeJoinBevel',
  miter: 'StrokeJoinMiter',
  round: 'StrokeJoinRound',
};

export const STROKE_DASH_CAPS = ['none', 'square', 'round'] as const;

export type TStrokeDashCap = (typeof STROKE_DASH_CAPS)[number];

export const STROKE_DASH_CAP_ICONS: Record<TStrokeDashCap, TIconProps['name']> = {
  none: 'StrokeCapNone',
  round: 'StrokeCapRound',
  square: 'StrokeCapSquare',
};

export const DEFAULT_STROKE_DASH_CAP: TStrokeDashCap = 'none';

export const DEFAULT_STROKE_DASH = '20';

export const DEFAULT_STROKE_GAP = '20';

export const DEFAULT_STROKE_DASHES = '20, 40, 60, 80';

export const DEFAULT_STROKE_STYLE: TStrokeStyle = 'solid';

export const DEFAULT_STROKE_JOIN: TStrokeJoin = 'miter';

export const DEFAULT_STROKE_PROFILE = StrokeProfile.uniform;

export const DEFAULT_MITER_ANGLE = '28.96°';
