// store
import { updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSmartSelectionAppendSuggestion } from 'types/design/smartSelection/types';

// utils
import { getDragNodeOrigins } from '../armDrag/getDragNodeOrigins';
import { getGeometryDeltaChanges } from '../../../../../utils/getGeometryDeltaChanges';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';

export const applyAppendSuggestion = (dispatch: AppDispatch, suggestion: TSmartSelectionAppendSuggestion): void => {
  const nodes = selectNodes(store.getState());
  const outlierBounds = getRotatedNodeBounds(nodes[suggestion.outlierId]);
  const { axis, insertAt, layout } = suggestion;
  const sizeKey = axis === 'x' ? 'width' : 'height';
  const crossAxis = axis === 'x' ? 'y' : 'x';
  const gapValue = layout.gaps[0].value;
  const edge = insertAt === 'start' ? layout.nodes[0] : layout.nodes[layout.nodes.length - 1];
  const targetMainAxis =
    insertAt === 'start' ? edge.bounds[axis] - gapValue - outlierBounds[sizeKey] : edge.bounds[axis] + edge.bounds[sizeKey] + gapValue;
  const deltaX = axis === 'x' ? targetMainAxis - outlierBounds.x : edge.bounds[crossAxis] - outlierBounds[crossAxis];
  const deltaY = axis === 'y' ? targetMainAxis - outlierBounds.y : edge.bounds[crossAxis] - outlierBounds[crossAxis];
  const origin = getDragNodeOrigins([suggestion.outlierId], nodes)[suggestion.outlierId];

  dispatch(updateNode({ changes: getGeometryDeltaChanges(origin, deltaX, deltaY), id: suggestion.outlierId }));
};
