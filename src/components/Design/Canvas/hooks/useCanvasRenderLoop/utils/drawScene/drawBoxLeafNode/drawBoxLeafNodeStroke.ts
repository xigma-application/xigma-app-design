// types
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawBoxLeafNodeStroke = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
): void => {
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
