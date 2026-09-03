// store
import { updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionGridAppendSuggestion } from 'types/design/smartSelection/types';

// utils
import { getDragNodeOrigins } from '../armDrag/getDragNodeOrigins';
import { getGeometryDeltaChanges } from '../../../../../utils/getGeometryDeltaChanges';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';

export const applyGridAppendSuggestion = (dispatch: AppDispatch, suggestion: TSmartSelectionGridAppendSuggestion): void => {
  const nodes = selectNodes(store.getState());
  const outlier = nodes[suggestion.outlierId];
  const outlierBounds = getRotatedNodeBounds(outlier);
  const deltaX = suggestion.target.x - outlierBounds.x;
  const deltaY = suggestion.target.y - outlierBounds.y;
  const origin = getDragNodeOrigins([suggestion.outlierId], nodes)[suggestion.outlierId];
  const canResize = 'rotation' in outlier && outlier.rotation === 0 && outlier.type !== NodeType.vector;
  const changes = getGeometryDeltaChanges(origin, deltaX, deltaY);

  dispatch(
    updateNode({
      changes: canResize ? { ...changes, height: suggestion.target.height, width: suggestion.target.width } : changes,
      id: suggestion.outlierId,
    }),
  );
};
