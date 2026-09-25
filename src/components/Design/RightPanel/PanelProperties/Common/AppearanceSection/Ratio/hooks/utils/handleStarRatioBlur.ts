import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TStarNode } from 'types/design/types';

// utils
import { commitStarRatio } from './commitStarRatio';
import { parseArcValue } from '../../../Arc/hooks/utils/parseArcValue';

export const handleStarRatioBlur = (
  event: FocusEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  nodes: TStarNode[],
  displayValue: string,
): void => {
  const parsed = parseArcValue(event.target.value);

  if (parsed !== null) {
    commitStarRatio(dispatch, nodes, () => parsed);
  } else {
    event.target.value = displayValue;
  }
};
