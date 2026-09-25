import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TStyledNode } from '../../../types';

// utils
import { clampOpacity } from './clampOpacity';
import { commitOnNodes } from '../../../utils/commitOnNodes';
import { commitOpacityChange } from './commitOpacityChange';

export const handleOpacityBlur = (
  event: FocusEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  nodes: TStyledNode[],
  displayValue: string,
): void => {
  const stripped = event.target.value.trim().replace(/[^\d.-]/g, '');
  const parsed = Number(stripped);

  if (stripped !== '' && !Number.isNaN(parsed)) {
    commitOnNodes(dispatch, nodes, (node) => commitOpacityChange(dispatch, node.id, clampOpacity(parsed)));
  } else {
    event.target.value = displayValue;
  }
};
