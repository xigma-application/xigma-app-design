// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseNode } from './drawEllipseNode';
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';
import { getEllipseWorldPoints } from 'utils/canvas/shapes/getEllipseWorldPoints';
import { hasEllipseCorners } from 'utils/canvas/ellipseArc/hasEllipseCorners';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';

export const drawEllipseLeafNode = (context: TDrawSceneContext, node: TEllipseNode, opacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;

  if (hasEllipseCorners(node)) {
    drawVectorFill(
      gl,
      program,
      buffer,
      null,
      null,
      [getEllipseWorldPoints(node, node.flipX ?? false, node.flipY ?? false, node.rotation)],
      node.fill,
      canvasWidth,
      canvasHeight,
      viewport,
      imageContext.isAlphaWriteEnabled,
      opacity,
    );
  } else {
    drawEllipseNode(
      gl,
      program,
      buffer,
      {
        ...node,
        arcEndAngle: node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
        arcStartAngle: node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
        fillAlpha: opacity,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      node.flipX ?? false,
      node.flipY ?? false,
      node.rotation,
    );
  }

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
      node.strokeAlign,
    );
  }
};
