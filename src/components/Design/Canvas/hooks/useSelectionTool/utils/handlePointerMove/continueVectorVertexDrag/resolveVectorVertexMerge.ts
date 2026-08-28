// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorVertex } from 'types/design/types';
import { TVectorAlignmentGuide } from '../../../../../utils/applyVectorPointSnapping';
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { getVectorVertexAtPointAcrossNodes } from '../../../../../utils/getVectorVertexAtPointAcrossNodes';

export const resolveVectorVertexMerge = (
  draggedVertices: Record<string, TVectorVertex>,
  dragState: TVectorVertexDragState,
  nodes: Record<string, TSceneNode>,
  guide: TVectorAlignmentGuide | null,
  mergeTolerance: number,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const [vertexId] = Object.keys(dragState.origins);
  const hit = getVectorVertexAtPointAcrossNodes(draggedVertices[vertexId], nodes, mergeTolerance, vertexId);

  if (hit) {
    draggedVertices[vertexId] = { id: vertexId, x: hit.point.x, y: hit.point.y };
    dragState.mergeTarget = { nodeId: hit.nodeId, vertexId: hit.vertexId };
    canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = null;
    setClassName('point');
  } else {
    dragState.mergeTarget = null;
    canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = guide;
    setClassName('move');
  }
};
