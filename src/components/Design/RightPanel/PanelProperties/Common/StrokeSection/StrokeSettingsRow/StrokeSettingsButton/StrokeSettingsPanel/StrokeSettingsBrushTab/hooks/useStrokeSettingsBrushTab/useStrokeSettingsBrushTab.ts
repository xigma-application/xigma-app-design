import { useRef } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes } from 'store/design/selectors';
import { updateNodes } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// others
import { STROKE_SCATTER_BRUSH_FIELDS } from '../../constants';

// types
import { TOriginalStrokeBrush, TStrokeBrushChanges, TUseStrokeSettingsBrushTabResult } from './types';

// utils
import { isStyledOrVectorNode } from '../../../../../../../AppearanceSection/utils/isStyledOrVectorNode';
import { getBrushCategoryId } from '../../utils/getBrushCategoryId';
import { getSharedStrokeBrushValue } from './utils/getSharedStrokeBrushValue';
import { getStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';
import { handleStrokeBrushCommit } from './utils/handleStrokeBrushCommit';
import { handleStrokeBrushDirectionChange } from './utils/handleStrokeBrushDirectionChange';
import { handleStrokeBrushPreview } from './utils/handleStrokeBrushPreview';
import { handleStrokeBrushScatterBlur } from './utils/handleStrokeBrushScatterBlur';

export const useStrokeSettingsBrushTab = (): TUseStrokeSettingsBrushTabResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isStyledOrVectorNode);
  const valuesList = nodes.length > 0 ? nodes.map(getStrokeBrushValues) : [getStrokeBrushValues(undefined)];
  const originalBrushesRef = useRef<TOriginalStrokeBrush[] | null>(null);
  const brush = getSharedStrokeBrushValue(valuesList, 'brush');
  const direction = getSharedStrokeBrushValue(valuesList, 'direction');
  const isScatterBrush = valuesList.map((values) => getBrushCategoryId(values.brush) === 'scatter');

  const update = (changes: TStrokeBrushChanges): void => {
    dispatch(updateNodes(nodes.map((node) => ({ changes, id: node.id }))));
  };

  const commit = (changes: TStrokeBrushChanges): void => {
    if (nodes.length > 0) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      update(changes);
      dispatch(endHistoryGesture());
    }
  };

  const onBrushRevert = (): void => {
    if (originalBrushesRef.current) {
      dispatch(updateNodes(originalBrushesRef.current.map(({ brush, id }) => ({ changes: { strokeBrush: brush }, id }))));
      originalBrushesRef.current = null;
    }
  };

  return {
    brush,
    direction,
    isDirectionBrush: isScatterBrush.every((isScatter) => !isScatter),
    isScatterBrush: isScatterBrush.every(Boolean),
    onBrushCommit: (nextBrush) => handleStrokeBrushCommit(nextBrush, originalBrushesRef.current, valuesList, onBrushRevert, commit),
    onBrushPreview: (nextBrush) => handleStrokeBrushPreview(nextBrush, originalBrushesRef, nodes, valuesList, update),
    onBrushRevert,
    onDirectionChange: (value) => handleStrokeBrushDirectionChange(value, direction, commit),
    onScatterBlur: (field) => (event) => handleStrokeBrushScatterBlur(event, field, getSharedStrokeBrushValue(valuesList, field), commit),
    scatterValues: Object.fromEntries(
      STROKE_SCATTER_BRUSH_FIELDS.map((field) => [field, getSharedStrokeBrushValue(valuesList, field)]),
    ) as TUseStrokeSettingsBrushTabResult['scatterValues'],
  };
};
