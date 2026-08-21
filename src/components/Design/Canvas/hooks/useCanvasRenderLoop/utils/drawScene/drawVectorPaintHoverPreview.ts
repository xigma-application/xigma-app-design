// others
import { DRAFT_FRAME_STROKE, MARQUEE_FILL_ALPHA, VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';

export const drawVectorPaintHoverPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode | null,
  hoveredFaceKey: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node && hoveredFaceKey) {
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const face = deriveVectorFaces(bakedNode).find((candidate) => candidate.key === hoveredFaceKey);

    if (face) {
      const isFilled = node.filledFaceKeys.includes(hoveredFaceKey);
      const color = isFilled ? VECTOR_EDGE_HOVER_STROKE : DRAFT_FRAME_STROKE;

      drawVectorFill(gl, program, buffer, [face.points], color, canvasWidth, canvasHeight, viewport, MARQUEE_FILL_ALPHA);
    }
  }
};
