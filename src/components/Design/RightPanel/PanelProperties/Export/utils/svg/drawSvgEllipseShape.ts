// types
import { TDraftRect } from 'types/canvas';
import { TEllipseNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getEllipseStrokeShapes } from 'utils/canvas/shapes/getEllipseStrokeShapes';
import { getEllipseWorldPoints } from 'utils/canvas/shapes/getEllipseWorldPoints';

export const drawSvgEllipseShape = async (
  elements: string[],
  defs: string[],
  node: TEllipseNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const opacity = getEffectiveOpacity(node, nodesById);
  const boxGeometry = { rect: { height: node.height, width: node.width, x: node.x, y: node.y }, rotation: node.rotation };

  await drawSvgPaintPolygons(
    elements,
    defs,
    node.fills,
    [getEllipseWorldPoints(node, node.flipX ?? false, node.flipY ?? false, node.rotation)],
    opacity,
    bounds,
    null,
    boxGeometry,
  );

  for (const { polygons } of (node.strokes?.length ? getEllipseStrokeShapes(node) : null) ?? []) {
    await drawSvgPaintPolygons(elements, defs, node.strokes as TPaint[], polygons, opacity, bounds);
  }
};
