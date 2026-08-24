// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { drawVectorFill } from './drawVectorFill';
import { drawVectorRoundedCaps } from './drawVectorRoundedCaps';
import { drawVectorStroke } from './drawVectorStroke';
import { drawVectorVariableStroke } from './drawVectorVariableStroke';
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';
import { getVectorFillColorForLoopKey } from '../vectorNetwork/getVectorFillColorForLoopKey';
import { getVectorFillLoopPoints } from '../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';

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

  renderedNode.filledFaceKeys.forEach((key) => {
    const points = getVectorFillLoopPoints(renderedNode, key);

    if (points) {
      drawVectorFill(gl, program, buffer, [points], getVectorFillColorForLoopKey(key), canvasWidth, canvasHeight, viewport);
    }
  });

  if (renderedNode.widthProfile) {
    drawVectorVariableStroke(gl, program, buffer, renderedNode, renderedNode.strokeColor, canvasWidth, canvasHeight, viewport);
  } else {
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
  }

  drawVectorRoundedCaps(gl, program, buffer, renderedNode, canvasWidth, canvasHeight, viewport);
};
