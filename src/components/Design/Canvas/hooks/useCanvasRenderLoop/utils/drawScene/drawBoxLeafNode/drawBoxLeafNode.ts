// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBoxLeafNodeFill } from './drawBoxLeafNodeFill';
import { drawBoxLeafNodeStroke } from './drawBoxLeafNodeStroke';
import { drawBoxLeafNodeStrokePaints } from './drawBoxLeafNodeStrokePaints';

export const drawBoxLeafNode = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth = 0,
): void => {
  drawBoxLeafNodeFill(context, node, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
  drawBoxLeafNodeStroke(context, node, opacity);
  drawBoxLeafNodeStrokePaints(context, node, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
};
