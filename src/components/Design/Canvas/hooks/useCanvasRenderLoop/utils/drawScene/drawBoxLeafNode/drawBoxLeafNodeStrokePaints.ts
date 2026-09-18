// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBoxPaints } from './drawBoxPaints';
import { getBoxStrokePolygons } from '../getBoxStrokePolygons';

export const drawBoxLeafNodeStrokePaints = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  if ('fills' in node && node.strokes && node.strokes.length > 0 && node.strokeWidth) {
    const polygons = getBoxStrokePolygons(node, node.strokeWidth, node.strokeAlign);
    drawBoxPaints(context, node, node.strokes, polygons, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
  }
};
