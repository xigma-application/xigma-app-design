import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TArcFieldKey } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { commitEllipseArcValue } from './commitEllipseArcValue';
import { parseArcValue } from './parseArcValue';

export const handleArcFieldBlur = (
  event: FocusEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  nodes: TEllipseNode[],
  key: TArcFieldKey,
  displayValue: string,
): void => {
  const parsed = parseArcValue(event.target.value);

  if (parsed === null) {
    event.target.value = displayValue;
  } else {
    commitEllipseArcValue(dispatch, nodes, key, () => parsed);
  }
};
