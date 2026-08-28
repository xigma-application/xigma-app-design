// types
import { TCanvasRefs, TVectorHandleHover } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds/getOneHopVectorVertexIds';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVectorHandlesInRect } from 'utils/canvas/vectorNetwork/getVectorHandlesInRect';

export const getVectorMarqueeHandleHitsForNode = (
  node: TVectorNode,
  rect: TDraftRect,
  visualSelectedVertexIds: string[],
  canvasRefs: TCanvasRefs,
): TVectorHandleHover[] => {
  const tangentVisibilityVertexIds = getTangentVisibilityVertexIds(
    node,
    visualSelectedVertexIds,
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current,
  );
  const oneHopVertexIds = getOneHopVectorVertexIds(node, tangentVisibilityVertexIds);

  return getVectorHandlesInRect(
    node,
    rect,
    tangentVisibilityVertexIds,
    oneHopVertexIds,
    canvasRefs.vectorEdit.preVectorMarqueeSegmentIdsRef.current,
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current,
  );
};
