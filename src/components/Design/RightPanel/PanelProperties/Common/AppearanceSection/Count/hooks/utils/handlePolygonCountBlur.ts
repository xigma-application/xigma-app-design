import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TPolygonNode } from 'types/design/types';

// utils
import { commitPolygonCount } from './commitPolygonCount';
import { parseArcValue } from '../../../Arc/hooks/utils/parseArcValue';

export const handlePolygonCountBlur = (
  event: FocusEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  nodes: TPolygonNode[],
  displayValue: string,
): void => {
  const parsed = parseArcValue(event.target.value);

  if (parsed !== null) {
    commitPolygonCount(dispatch, nodes, () => parsed);
  } else {
    event.target.value = displayValue;
  }
};
