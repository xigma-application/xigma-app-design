// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TBoxPaintsBounds } from './types';
import { TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';
import { TFillRule, TPoint } from 'types/canvas';

// utils
import { drawVectorFillGroup } from '../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorFillGroup';
import { getFillsInPaintOrder } from '../getFillsInPaintOrder';
import { getScaledFillPaints } from '../getScaledFillPaints';
import { resolvePatternPaintTile } from './resolvePatternPaintTile';
import { TBoxFillRotation } from 'utils/canvas/drawVectorNode/drawVectorPatternSourceTile';
import { TResolvedPatternSourceTile } from '../resolvePatternSourceTile';

const resolvePaintTiles = (
  context: TDrawSceneContext,
  paints: TPaint[],
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): (TResolvedPatternSourceTile | null)[] =>
  paints.map((paint) => resolvePatternPaintTile(context, paint, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth));

const getBoxRotation = (node: TBoxPaintsBounds): TBoxFillRotation => ({
  center: { x: node.x + node.width / 2, y: node.y + node.height / 2 },
  degrees: node.rotation,
  localBounds: { height: node.height, width: node.width, x: node.x, y: node.y },
});

const drawPaintsInOrder = (
  context: TDrawSceneContext,
  polygons: TPoint[][],
  paints: TPaint[],
  resolvedTiles: (TResolvedPatternSourceTile | null)[],
  boxRotation: TBoxFillRotation,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  fillRule: TFillRule,
): void => {
  paints.forEach((paint, index) => {
    drawVectorFillGroup(context, faceBufferCache, null, polygons, [paint], [resolvedTiles[index]?.tile ?? null], boxRotation, fillRule);
  });
};

const releasePaintTiles = (resolvedTiles: (TResolvedPatternSourceTile | null)[]): void => {
  resolvedTiles.forEach((resolved) => resolved?.release());
};

export const drawBoxPaints = (
  context: TDrawSceneContext,
  node: TBoxPaintsBounds,
  sourcePaints: TPaint[],
  polygons: TPoint[][],
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null = null,
  fillRule: TFillRule = 'evenOdd',
): void => {
  const paints = getFillsInPaintOrder(getScaledFillPaints(sourcePaints, opacity));
  const resolvedTiles = resolvePaintTiles(context, paints, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
  const boxRotation = getBoxRotation(node);

  drawPaintsInOrder(context, polygons, paints, resolvedTiles, boxRotation, faceBufferCache, fillRule);
  releasePaintTiles(resolvedTiles);
};
