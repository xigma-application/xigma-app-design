import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorHandleDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

export const commitVectorCornerHandleDrag = (
  node: TVectorNode,
  vertexId: string,
  hit: { end: 'end' | 'start'; segmentId: string },
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  vectorHandleDragRef: RefObject<TVectorHandleDragState | null>,
): void => {
  dispatch(updateNode({ changes: { vertexHandleModes: { ...node.vertexHandleModes, [vertexId]: 'symmetric' } }, id: node.id }));

  canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [{ end: hit.end, segmentId: hit.segmentId }];
  canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
  canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
  vectorHandleDragRef.current = { end: hit.end, nodeId: node.id, segmentId: hit.segmentId, vertexId };
};
