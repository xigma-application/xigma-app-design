import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseNode, TSceneNode } from 'types/design/types';

// utils
import { drawPdfPaintPolygons } from './drawPdfPaintPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getEllipseStrokeRingPoints } from 'utils/canvas/shapes/getEllipseStrokeRingPoints';
import { getEllipseWorldPoints } from 'utils/canvas/shapes/getEllipseWorldPoints';
import { hasVectorStroke } from '../hasVectorStroke';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawPdfEllipseShape = (
  page: PDFPage,
  node: TEllipseNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const toDesign = (point: TPoint): TPoint =>
    rotatePoint(flipPoint(point, center, node.flipX ?? false, node.flipY ?? false), center, node.rotation);

  drawPdfPaintPolygons(
    page,
    node.fills,
    [getEllipseWorldPoints(node, node.flipX ?? false, node.flipY ?? false, node.rotation)],
    opacity,
    bounds,
    graphicsStates,
  );

  if (node.strokes && hasVectorStroke(node)) {
    drawPdfPaintPolygons(
      page,
      node.strokes,
      getEllipseStrokeRingPoints(node, node.strokeWidth as number).map((polygon) => polygon.map(toDesign)),
      opacity,
      bounds,
      graphicsStates,
    );
  }
};
