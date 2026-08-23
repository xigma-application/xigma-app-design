// others
import { DRAFT_FRAME_STROKE, VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorShapeBuilderHoverPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  touchedFaces: TVectorShapeBuilderTouchedFaces,
  isSubtract: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const color = isSubtract ? VECTOR_EDGE_HOVER_STROKE : DRAFT_FRAME_STROKE;

  Object.entries(touchedFaces).forEach(([nodeId, faceKeys]) => {
    const node = getVectorEditingNode(nodes, nodeId);

    if (node) {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const faces = deriveVectorFaces(bakedNode).filter((face) => faceKeys.has(face.key));

      faces.forEach((face) => drawVectorHatchFill(gl, program, buffer, [face.points], color, canvasWidth, canvasHeight, viewport));
    }
  });
};
