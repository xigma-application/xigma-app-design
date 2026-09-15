// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPathOutlineStyle } from './getPathOutlineStyles';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { drawVectorFillGroup } from './drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup';
import { getBoxFillPolygon } from './getBoxFillPolygon';
import { getFillsInPaintOrder } from './getFillsInPaintOrder';
import { getScaledFillPaints } from './getScaledFillPaints';
import { resolvePatternSourceTile } from './resolvePatternSourceTile';

const drawBoxLeafNodeFill = (
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
    const paints = getFillsInPaintOrder(getScaledFillPaints(node.fills, opacity));
    const resolvedTiles = paints.map((paint) =>
      paint.type === 'pattern' && paint.sourceNodeId
        ? resolvePatternSourceTile(context, paint.sourceNodeId, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth)
        : null,
    );

    drawVectorFillGroup(
      context,
      null,
      null,
      [getBoxFillPolygon(node)],
      paints,
      resolvedTiles.map((resolved) => resolved?.tile ?? null),
    );
    resolvedTiles.forEach((resolved) => resolved?.release());
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
};
