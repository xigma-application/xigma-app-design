// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../../AppearanceSection/types';
import { TStrokeBrushChanges, TUseStrokeSettingsBrushTabResult } from './types';

// utils
import { getStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';
import { handleStrokeBrushCommit } from './utils/handleStrokeBrushCommit';
import { handleStrokeBrushDirectionChange } from './utils/handleStrokeBrushDirectionChange';
import { handleStrokeBrushScatterBlur } from './utils/handleStrokeBrushScatterBlur';

export const useStrokeSettingsBrushTab = (): TUseStrokeSettingsBrushTabResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const values = getStrokeBrushValues(node);

  const update = (changes: TStrokeBrushChanges): void => {
    if (node) {
      dispatch(updateNode({ changes, id: node.id }));
    }
  };

  const commit = (changes: TStrokeBrushChanges): void => {
    if (node) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      update(changes);
      dispatch(endHistoryGesture());
    }
  };

  return {
    brush: values.brush,
    direction: values.direction,
    onBrushCommit: (nextBrush, originalBrush) => handleStrokeBrushCommit(nextBrush, originalBrush, update, commit),
    onBrushSelect: (nextBrush) => update({ strokeBrush: nextBrush }),
    onDirectionChange: (value) => handleStrokeBrushDirectionChange(value, values.direction, commit),
    onScatterBlur: (field) => (event) => handleStrokeBrushScatterBlur(event, field, values[field], commit),
    scatterValues: values,
  };
};
