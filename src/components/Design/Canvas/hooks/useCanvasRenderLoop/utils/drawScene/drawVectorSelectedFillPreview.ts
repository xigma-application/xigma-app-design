// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorFullySelectedFaces } from 'utils/canvas/vectorNetwork/getVectorFullySelectedFaces';

export const drawVectorSelectedFillPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
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
      drawVectorHatchFill(gl, program, buffer, faces, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    }
  }
};
