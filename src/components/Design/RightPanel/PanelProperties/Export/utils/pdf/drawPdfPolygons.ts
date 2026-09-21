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

const getPolygonOperators = (polygon: TPoint[], bounds: TDraftRect): PDFOperator[] => {
  const toPage = (point: TPoint): [number, number] => [point.x - bounds.x, bounds.height - (point.y - bounds.y)];
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
): void => {
  const [red, green, blue] = hexToRgbFloat(color);

  page.pushOperators(
    pushGraphicsState(),
    setGraphicsState(getPdfGraphicsState(page, opacity, graphicsStates)),
    setFillingRgbColor(red, green, blue),
    ...polygons.filter((polygon) => polygon.length >= 3).flatMap((polygon) => getPolygonOperators(polygon, bounds)),
    PDFOperator.of(PDFOperatorNames.FillEvenOdd),
    popGraphicsState(),
  );
};
