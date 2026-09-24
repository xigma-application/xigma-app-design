import { MutableRefObject } from 'react';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroupIds } from './getSpacingGroupIds';

export const startSpacingDrag = (
  dispatch: AppDispatch,
  items: TSceneNode[],
  orderRef: MutableRefObject<Record<TSpacingAxis, string[][]>>,
): void => {
  orderRef.current = {
    horizontal: getSpacingGroupIds(items, 'horizontal'),
    vertical: getSpacingGroupIds(items, 'vertical'),
  };
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
};
