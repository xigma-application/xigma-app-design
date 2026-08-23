// others
import { VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorDraggedFillFaces } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorDraggedFillPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  draggedFillFaces: TVectorDraggedFillFaces | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (draggedFillFaces) {
    const faces = Object.entries(draggedFillFaces).flatMap(([nodeId, faceKeys]) => {
      const node = getVectorEditingNode(nodes, nodeId);

      if (!node) return [];

      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };

      return deriveVectorFaces(bakedNode)
        .filter((face) => faceKeys.includes(face.key))
        .map((face) => face.points);
    });

    drawVectorHatchFill(gl, program, buffer, faces, VECTOR_EDGE_HOVER_STROKE, canvasWidth, canvasHeight, viewport);
  }
};
