// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseNode, TSceneNode } from 'types/design/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getEllipseStrokeRingPoints } from 'utils/canvas/shapes/getEllipseStrokeRingPoints';
import { getEllipseWorldPoints } from 'utils/canvas/shapes/getEllipseWorldPoints';
import { hasVectorStroke } from '../hasVectorStroke';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawSvgEllipseShape = async (
  elements: string[],
  defs: string[],
  node: TEllipseNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const opacity = getEffectiveOpacity(node, nodesById);
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const boxGeometry = { rect: { height: node.height, width: node.width, x: node.x, y: node.y }, rotation: node.rotation };
  const toDesign = (point: TPoint): TPoint =>
    rotatePoint(flipPoint(point, center, node.flipX ?? false, node.flipY ?? false), center, node.rotation);

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

  if (node.strokes && hasVectorStroke(node)) {
    await drawSvgPaintPolygons(
      elements,
      defs,
      node.strokes,
      getEllipseStrokeRingPoints(node, node.strokeWidth as number).map((polygon) => polygon.map(toDesign)),
      opacity,
      bounds,
    );
  }
};
