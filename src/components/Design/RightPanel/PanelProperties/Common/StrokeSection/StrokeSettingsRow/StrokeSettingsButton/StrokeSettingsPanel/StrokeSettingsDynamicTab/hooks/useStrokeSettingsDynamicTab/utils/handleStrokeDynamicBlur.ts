import { FocusEvent } from 'react';

// types
import { TCommitStrokeDynamicChanges, TStrokeDynamicField } from '../../../types';

// others
import { STROKE_DYNAMIC_LIMITS } from '../../../constants';

// utils
import { getStrokeDynamicValueFromInput } from 'utils/design/stroke/getStrokeDynamicValueFromInput';

export const handleStrokeDynamicBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TStrokeDynamicField,
  current: number,
  commit: TCommitStrokeDynamicChanges,
): void => {
  const { max, min, nodeKey } = STROKE_DYNAMIC_LIMITS[field];
  const next = getStrokeDynamicValueFromInput(event.target.value, min, max);

  if (next !== undefined && next !== current) {
    commit({ [nodeKey]: next });
  }

  event.target.value = `${next ?? current}%`;
};
