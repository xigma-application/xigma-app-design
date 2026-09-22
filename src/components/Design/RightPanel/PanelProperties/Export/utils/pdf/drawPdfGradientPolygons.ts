import { PDFName, PDFOperator, PDFOperatorNames, PDFPage, popGraphicsState, pushGraphicsState, setGraphicsState } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfAxialShadingPattern } from './getPdfAxialShadingPattern';
import { getPdfFunctionBasedShadingPattern } from './getPdfFunctionBasedShadingPattern';
import { getPdfGraphicsState } from './getPdfGraphicsState';
import { getPdfPolygonPathOperators } from './drawPdfPolygons';
import { getPdfGradientGeometry } from './getPdfGradientGeometry';
import { getPdfRadialShadingPattern } from './getPdfRadialShadingPattern';
import { registerPdfPattern } from './registerPdfPattern';

const getPdfGradientPatternDict = (page: PDFPage, paint: TGradientPaint, bounds: TDraftRect): Record<string, unknown> => {
  const { context } = page.doc;
  const geometry = getPdfGradientGeometry(paint, bounds);

  switch (paint.type) {
    case 'gradient-linear':
      return getPdfAxialShadingPattern(context, paint.stops, geometry);
    case 'gradient-radial':
      return getPdfRadialShadingPattern(context, paint.stops, geometry, paint.radiusRatio);
    default:
      return getPdfFunctionBasedShadingPattern(context, paint.type, paint.stops, geometry, paint.radiusRatio ?? 1, bounds);
  }
};

export const drawPdfGradientPolygons = (
  page: PDFPage,
  paint: TGradientPaint,
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const patternName = registerPdfPattern(page, getPdfGradientPatternDict(page, paint, bounds));

  page.pushOperators(
    pushGraphicsState(),
    setGraphicsState(getPdfGraphicsState(page, opacity, graphicsStates)),
    PDFOperator.of(PDFOperatorNames.NonStrokingColorspace, [PDFName.of('Pattern')]),
    PDFOperator.of(PDFOperatorNames.NonStrokingColorN, [patternName]),
    ...getPdfPolygonPathOperators(polygons, bounds),
    PDFOperator.of(PDFOperatorNames.FillEvenOdd),
    popGraphicsState(),
  );
};
