import { FocusEvent, useRef } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TSpacingAxis } from '../types';

// utils
import { applySelectionSpacing } from './utils/applySelectionSpacing';
import { getSelectionSpacing } from './utils/getSelectionSpacing';
import { handleSpacingBlur } from './utils/handleSpacingBlur';
import { getColumnSpacingAxes } from './utils/getColumnSpacingAxes';
import { getColumnSpacingItems } from './utils/getColumnSpacingItems';
import { startSpacingDrag } from './utils/startSpacingDrag';

export type TUseColumnSpacingResult = {
  displayHorizontal: number | string;
  displayVertical: number | string;
  horizontal: number;
  isHorizontalVisible: boolean;
  isVerticalVisible: boolean;
  isVisible: boolean;
  onBlurHorizontal: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurVertical: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubHorizontal: TFunc<[number]>;
  onScrubVertical: TFunc<[number]>;
  vertical: number;
};

export const useColumnSpacing = (): TUseColumnSpacingResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const items = getColumnSpacingItems(selectedNodes, nodes);
  const axes = getColumnSpacingAxes(selectedNodes.length, items);
  const orderRef = useRef<Record<TSpacingAxis, string[][]>>({ horizontal: [], vertical: [] });
  const horizontalSpacing = axes.horizontal ? getSelectionSpacing(items, 'horizontal') : 0;
  const verticalSpacing = axes.vertical ? getSelectionSpacing(items, 'vertical') : 0;
  const displayHorizontal = horizontalSpacing === 'mixed' ? MIXED_LABEL : horizontalSpacing;
  const displayVertical = verticalSpacing === 'mixed' ? MIXED_LABEL : verticalSpacing;

  return {
    displayHorizontal,
    displayVertical,
    horizontal: horizontalSpacing === 'mixed' ? 0 : horizontalSpacing,
    isHorizontalVisible: axes.horizontal,
    isVerticalVisible: axes.vertical,
    isVisible: axes.horizontal || axes.vertical,
    onBlurHorizontal: handleSpacingBlur(dispatch, items, 'horizontal', displayHorizontal),
    onBlurVertical: handleSpacingBlur(dispatch, items, 'vertical', displayVertical),
    onDragEnd: (): void => {
      dispatch(endHistoryGesture());
    },
    onDragStart: (): void => startSpacingDrag(dispatch, items, orderRef),
    onScrubHorizontal: (value): void => applySelectionSpacing(dispatch, orderRef.current.horizontal, 'horizontal', value),
    onScrubVertical: (value): void => applySelectionSpacing(dispatch, orderRef.current.vertical, 'vertical', value),
    vertical: verticalSpacing === 'mixed' ? 0 : verticalSpacing,
  };
};
