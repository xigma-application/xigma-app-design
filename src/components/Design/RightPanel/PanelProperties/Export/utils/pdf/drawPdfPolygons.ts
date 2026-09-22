import {
  closePath,
  PDFOperatorNames,
  lineTo,
  moveTo,
  PDFName,
  PDFOperator,
  PDFPage,
  popGraphicsState,
  pushGraphicsState,
  setFillingRgbColor,
  setGraphicsState,
} from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getPdfGraphicsState } from './getPdfGraphicsState';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { toPdfPagePoint } from './toPdfPagePoint';

export const getPdfPolygonPathOperators = (polygons: TPoint[][], bounds: TDraftRect): PDFOperator[] =>
  polygons.filter((polygon) => polygon.length >= 3).flatMap((polygon) => getPolygonOperators(polygon, bounds));

const getPolygonOperators = (polygon: TPoint[], bounds: TDraftRect): PDFOperator[] => {
  const toPage = (point: TPoint): [number, number] => {
    const pagePoint = toPdfPagePoint(point, bounds);
    return [pagePoint.x, pagePoint.y];
  };
  const [first, ...rest] = polygon;

  return [moveTo(...toPage(first)), ...rest.map((point) => lineTo(...toPage(point))), closePath()];
};

export const drawPdfPolygons = (
  page: PDFPage,
  polygons: TPoint[][],
  color: string,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
  fillRule: 'evenOdd' | 'nonZero' = 'evenOdd',
): void => {
  const [red, green, blue] = hexToRgbFloat(color);

  page.pushOperators(
    pushGraphicsState(),
    setGraphicsState(getPdfGraphicsState(page, opacity, graphicsStates)),
    setFillingRgbColor(red, green, blue),
    ...getPdfPolygonPathOperators(polygons, bounds),
    PDFOperator.of(fillRule === 'evenOdd' ? PDFOperatorNames.FillEvenOdd : PDFOperatorNames.FillNonZero),
    popGraphicsState(),
  );
};
