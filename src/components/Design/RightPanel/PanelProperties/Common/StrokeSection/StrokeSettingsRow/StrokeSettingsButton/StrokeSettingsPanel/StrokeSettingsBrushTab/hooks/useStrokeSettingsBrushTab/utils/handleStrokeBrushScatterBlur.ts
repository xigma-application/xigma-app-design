import { FocusEvent } from 'react';

// types
import { TApplyStrokeBrushChanges } from '../types';

// others
import { STROKE_SCATTER_BRUSH_LIMITS, TStrokeScatterBrushField } from '../../../constants';

// utils
import { getStrokeBrushValueFromInput } from 'utils/design/stroke/getStrokeBrushValueFromInput';

export const handleStrokeBrushScatterBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TStrokeScatterBrushField,
  current: number,
  commit: TApplyStrokeBrushChanges,
): void => {
  const { max, min, nodeKey, unit } = STROKE_SCATTER_BRUSH_LIMITS[field];
  const next = getStrokeBrushValueFromInput(event.target.value, min, max);

  if (next !== undefined && next !== current) {
    commit({ [nodeKey]: next });
  }

  event.target.value = `${next ?? current}${unit}`;
};
