// types
import { TDrawContext } from './types';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawBoxLeafNode = (context: TDrawContext, node: TFrameNode | TRectangleNode | TSectionNode, dragOpacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawRect(gl, program, buffer, { ...node, fillAlpha: dragOpacity }, canvasWidth, canvasHeight, viewport, node.rotation);

  if ('strokeColor' in node && node.strokeColor && node.strokeWidth) {
    drawThickOutline(gl, program, buffer, node, node.strokeColor, node.strokeWidth, canvasWidth, canvasHeight, viewport, node.rotation);
  }
};
