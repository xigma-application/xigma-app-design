// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorFullySelectedFaces } from 'utils/canvas/vectorNetwork/getVectorFullySelectedFaces';

export const drawVectorSelectedFillPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (selectedVertexIds.length > 0) {
    const faces = vectorEditingNodeIds.flatMap((nodeId) => {
      const node = getVectorEditingNode(nodes, nodeId);

      if (node) {
        const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
        return getVectorFullySelectedFaces(bakedNode, selectedVertexIds).map((face) => face.points);
      }

      return [];
    });

    if (faces.length > 0) {
      drawVectorHatchFill(gl, program, buffer, faces, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    }
  }
};
