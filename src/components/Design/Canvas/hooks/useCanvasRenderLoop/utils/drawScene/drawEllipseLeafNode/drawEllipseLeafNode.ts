// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDrawContext } from '../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseNode } from './drawEllipseNode';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';

export const drawEllipseLeafNode = (context: TDrawContext, node: TEllipseNode, dragOpacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawEllipseNode(
    gl,
    program,
    buffer,
    {
      ...node,
      arcEndAngle: node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
      arcStartAngle: node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
      fillAlpha: dragOpacity,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    node.flipX ?? false,
    node.flipY ?? false,
    node.rotation,
  );

  if (node.strokeColor && node.strokeWidth) {
    drawThickEllipseOutline(
      gl,
      program,
      buffer,
      node,
      node.strokeColor,
      node.strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      node.rotation,
    );
  }
};
