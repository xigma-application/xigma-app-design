// types
import { TDrawSceneContext } from './types';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { drawVectorFillGroup } from './drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup';
import { getBoxFillPolygon } from './getBoxFillPolygon';
import { getFillsInPaintOrder } from './getFillsInPaintOrder';
import { getScaledFillPaints } from './getScaledFillPaints';

const drawBoxLeafNodeFill = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode | TSectionNode, opacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if ('fills' in node) {
    drawVectorFillGroup(context, null, null, [getBoxFillPolygon(node)], getFillsInPaintOrder(getScaledFillPaints(node.fills, opacity)));
  } else {
    drawRect(gl, program, buffer, { ...node, fillAlpha: opacity }, canvasWidth, canvasHeight, viewport, node.rotation);
  }
};

const drawBoxLeafNodeStroke = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode | TSectionNode, opacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if ('strokeColor' in node && node.strokeColor && node.strokeWidth) {
    drawThickOutline(
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
      opacity,
    );
  }
};

export const drawBoxLeafNode = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode | TSectionNode, opacity: number): void => {
  drawBoxLeafNodeFill(context, node, opacity);
  drawBoxLeafNodeStroke(context, node, opacity);
};
