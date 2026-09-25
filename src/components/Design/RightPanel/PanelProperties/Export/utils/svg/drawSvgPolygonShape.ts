// types
import { TDraftRect } from 'types/canvas';
import { TPolygonNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getPolygonStrokeShapes } from 'utils/canvas/shapes/getPolygonStrokeShapes';
import { getPolygonWorldPoints } from 'utils/canvas/shapes/getPolygonWorldPoints';

export const drawSvgPolygonShape = async (
  elements: string[],
  defs: string[],
  node: TPolygonNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const opacity = getEffectiveOpacity(node, nodesById);
  const boxGeometry = { rect: { height: node.height, width: node.width, x: node.x, y: node.y }, rotation: node.rotation };

  await drawSvgPaintPolygons(elements, defs, node.fills, [getPolygonWorldPoints(node)], opacity, bounds, null, boxGeometry);

  for (const { polygons } of (node.strokes?.length ? getPolygonStrokeShapes(node) : null) ?? []) {
    await drawSvgPaintPolygons(elements, defs, node.strokes as TPaint[], polygons, opacity, bounds);
  }
};
