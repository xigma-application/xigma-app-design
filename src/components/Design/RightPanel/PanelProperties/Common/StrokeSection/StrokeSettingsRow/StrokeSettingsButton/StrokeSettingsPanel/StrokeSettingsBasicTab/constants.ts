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

export const DEFAULT_STROKE_STYLE: TStrokeStyle = 'solid';

export const DEFAULT_STROKE_JOIN: TStrokeJoin = 'miter';

export const DEFAULT_STROKE_PROFILE = StrokeProfile.uniform;

export const DEFAULT_MITER_ANGLE = '28.96°';
