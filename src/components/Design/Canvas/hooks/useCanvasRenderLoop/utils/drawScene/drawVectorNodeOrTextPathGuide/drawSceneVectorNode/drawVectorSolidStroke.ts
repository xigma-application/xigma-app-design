// types
import { TDrawSceneContext } from '../../types';
import { TSolidPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorRoundedCaps } from 'utils/canvas/drawVectorNode/drawVectorRoundedCaps';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { drawVectorVariableStroke } from './drawVectorVariableStroke';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';

export const drawVectorSolidStroke = (context: TDrawSceneContext, node: TVectorNode, paint: TSolidPaint, opacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const alpha = (paint.opacity / 100) * opacity;

  if (node.widthProfile) {
    drawVectorVariableStroke(gl, program, buffer, node, paint.color, canvasWidth, canvasHeight, viewport, alpha);
  } else {
    drawVectorThickStrokeVertices(
      gl,
      program,
      buffer,
      imageContext.strokeBufferCache,
      getVectorNodeThickStrokeVertices(node, node.strokeWidth / 2),
      paint.color,
      canvasWidth,
      canvasHeight,
      viewport,
      alpha,
    );
  }

  drawVectorRoundedCaps(gl, program, buffer, node, paint.color, canvasWidth, canvasHeight, viewport, alpha);
};
