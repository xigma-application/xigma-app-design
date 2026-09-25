import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCountNode } from '../../types';

// utils
import { commitShapeCount } from './commitShapeCount';
import { parseArcValue } from '../../../Arc/hooks/utils/parseArcValue';

export const handleShapeCountBlur = (
  event: FocusEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  nodes: TCountNode[],
  displayValue: string,
): void => {
  const parsed = parseArcValue(event.target.value);

  if (parsed !== null) {
    commitShapeCount(dispatch, nodes, () => parsed);
  } else {
    event.target.value = displayValue;
  }
};
