// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBoxPaints } from './drawBoxPaints';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getBoxFillPolygon } from '../getBoxFillPolygon';

export const drawBoxLeafNodeFill = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if ('fills' in node) {
    drawBoxPaints(
      context,
      node,
      node.fills,
      [getBoxFillPolygon(node)],
      opacity,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
      patternSourceDepth,
    );
  } else {
    drawRect(gl, program, buffer, { ...node, fillAlpha: opacity }, canvasWidth, canvasHeight, viewport, node.rotation);
  }
};
