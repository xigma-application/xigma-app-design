import { MutableRefObject } from 'react';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingOrder } from './getSpacingOrder';

export const startSpacingDrag = (
  dispatch: AppDispatch,
  items: TSceneNode[],
  orderRef: MutableRefObject<Record<TSpacingAxis, string[]>>,
): void => {
  orderRef.current = {
    horizontal: getSpacingOrder(items, 'horizontal').map((node) => node.id),
    vertical: getSpacingOrder(items, 'vertical').map((node) => node.id),
  };
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
};
