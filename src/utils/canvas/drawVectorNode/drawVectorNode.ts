// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { deriveVectorFaces } from '../vectorNetwork/deriveVectorFaces';
import { drawVectorFill } from './drawVectorFill';
import { drawVectorStroke } from './drawVectorStroke';
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';

export const drawVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const { segments, vertices } = bakeVectorNodeRotation(node);
  const renderedNode: TVectorNode = { ...node, segments, vertices };

  if (renderedNode.fillColor) {
    const filledFaces = deriveVectorFaces(renderedNode)
      .filter((face) => renderedNode.filledFaceKeys.includes(face.key))
      .map((face) => face.points);

    if (filledFaces.length > 0) {
      drawVectorFill(gl, program, buffer, filledFaces, renderedNode.fillColor, canvasWidth, canvasHeight, viewport);
    }
  }

  drawVectorStroke(
    gl,
    program,
    buffer,
    flattenVectorSegments(renderedNode),
    renderedNode.strokeColor,
    renderedNode.strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
