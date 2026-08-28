// store
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { setExclusiveVectorSelection } from './setExclusiveVectorSelection';
import { splitVectorSegment } from '../../../../useDrawPenTool/utils/handlePointerDown/splitVectorSegment';

export const applySplitSegmentClickAction = (
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  nodeId: string,
  segmentId: string,
  t: number,
): void => {
  const node = getVectorEditingNode(store.getState().design.pages[store.getState().design.activePageId].nodes, nodeId);

  if (node) {
    const { newVertexId, segments, vertices } = splitVectorSegment(node, segmentId, t);

    dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
    setExclusiveVectorSelection(canvasRefs, { vertexIds: [newVertexId] });
  }
};
