// types
import { StrokeDashCap, StrokeJoin, StrokeProfile, StrokeStyle } from 'types/design/enums';
import { TIconProps } from '@xigma/components';

export const STROKE_STYLES: StrokeStyle[] = [StrokeStyle.solid, StrokeStyle.dashed, StrokeStyle.custom];

export const STROKE_STYLE_ICONS: Partial<Record<StrokeStyle, TIconProps['name']>> = {
  [StrokeStyle.dashed]: 'StrokeDashed',
  [StrokeStyle.solid]: 'StrokeSolid',
};

export const STROKE_STYLE_ICON_SIZE = 24;

export const STROKE_STYLE_MENU_WIDTH_PX = 144;

export const STROKE_JOINS: StrokeJoin[] = [StrokeJoin.miter, StrokeJoin.bevel, StrokeJoin.round];

export const STROKE_JOIN_ICONS: Record<StrokeJoin, TIconProps['name']> = {
  [StrokeJoin.bevel]: 'StrokeJoinBevel',
  [StrokeJoin.miter]: 'StrokeJoinMiter',
  [StrokeJoin.round]: 'StrokeJoinRound',
};

export const STROKE_DASH_CAPS: StrokeDashCap[] = [StrokeDashCap.none, StrokeDashCap.square, StrokeDashCap.round];

export const STROKE_DASH_CAP_ICONS: Record<StrokeDashCap, TIconProps['name']> = {
  [StrokeDashCap.none]: 'StrokeCapNone',
  [StrokeDashCap.round]: 'StrokeCapRound',
  [StrokeDashCap.square]: 'StrokeCapSquare',
};

export const DEFAULT_STROKE_DASH_CAP = StrokeDashCap.none;

export const DEFAULT_STROKE_STYLE = StrokeStyle.solid;

export const DEFAULT_STROKE_JOIN = StrokeJoin.miter;

export const DEFAULT_STROKE_PROFILE = StrokeProfile.uniform;
