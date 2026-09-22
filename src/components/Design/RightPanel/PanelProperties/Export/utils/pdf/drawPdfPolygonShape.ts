import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonShapePoints } from './getPolygonShapePoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawPdfPolygonShape = (
  page: PDFPage,
  node: TPolygonNode,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  if (node.fill) {
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const toDesign = (point: TPoint): TPoint => rotatePoint(flipPoint(point, center, node.flipX, node.flipY), center, node.rotation);

    drawPdfPolygons(
      page,
      [getPolygonShapePoints(node, node.sides, node.cornerRadius ?? 0).map(toDesign)],
      node.fill,
      opacity,
      bounds,
      graphicsStates,
    );
  }
};
