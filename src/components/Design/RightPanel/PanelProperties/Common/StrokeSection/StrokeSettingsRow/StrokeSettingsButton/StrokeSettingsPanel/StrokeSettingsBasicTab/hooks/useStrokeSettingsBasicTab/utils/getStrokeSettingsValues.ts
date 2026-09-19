// types
import { StrokeAlign, StrokeJoin, StrokeStyle } from 'types/design/enums';
import { TStrokeSettingsValues, TStrokeSettingsValuesSource } from '../types';

// others
import { DEFAULT_STROKE_DASH_CAP, DEFAULT_STROKE_JOIN, DEFAULT_STROKE_STYLE } from '../../../constants';
import { STROKE_DASH_DEFAULT, STROKE_DASHES_DEFAULT } from 'constant/strokeDash';
import { STROKE_MITER_ANGLE_DEFAULT } from 'constant/strokeMiterAngle';

export const getStrokeSettingsValues = (node: TStrokeSettingsValuesSource | undefined): TStrokeSettingsValues => {
  const dash = node?.strokeDash ?? STROKE_DASH_DEFAULT;
  const join = node?.strokeJoin ?? DEFAULT_STROKE_JOIN;
  const style = node?.strokeStyle ?? DEFAULT_STROKE_STYLE;

  return {
    dash,
    dashCap: node?.strokeDashCap ?? DEFAULT_STROKE_DASH_CAP,
    dashes: node?.strokeDashes ?? STROKE_DASHES_DEFAULT,
    gap: node?.strokeGap ?? dash,
    hasDashes: style !== StrokeStyle.solid,
    isCustom: style === StrokeStyle.custom,
    isDashed: style === StrokeStyle.dashed,
    isMiter: join === StrokeJoin.miter && (node?.strokeAlign ?? StrokeAlign.inside) !== StrokeAlign.inside,
    join,
    miterAngle: node?.strokeMiterAngle ?? STROKE_MITER_ANGLE_DEFAULT,
    style,
  };
};
