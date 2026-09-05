// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorFullySelectedFaces } from 'utils/canvas/vectorNetwork/getVectorFullySelectedFaces';

export const drawVectorSelectedFillPreview = (
  context: TDrawSceneContext,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  refs: TCanvasRefs,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;

  if (selectedVertexIds.length > 0) {
    const faces = vectorEditingNodeIds.flatMap((nodeId) => {
      const node = getVectorEditingNode(nodes, nodeId);

      if (node) {
        const bakedNode = getRenderedVectorNode(node);
        return getVectorFullySelectedFaces(bakedNode, selectedVertexIds).map((face) => face.points);
      }

      return [];
    });

    if (faces.length > 0) {
      drawVectorHatchFill(
        gl,
        program,
        buffer,
        faces,
        DRAFT_FRAME_STROKE,
        canvasWidth,
        canvasHeight,
        viewport,
        imageContext.isAlphaWriteEnabled,
      );
    }
  }
};
