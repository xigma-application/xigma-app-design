import { PDFName, PDFOperator, PDFOperatorNames, PDFPage, popGraphicsState, pushGraphicsState, setGraphicsState } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfAxialShadingPattern } from './getPdfAxialShadingPattern';
import { getPdfFunctionBasedShadingPattern } from './getPdfFunctionBasedShadingPattern';
import { getPdfGradientSoftMaskState } from './getPdfGradientSoftMaskState';
import { getPdfGraphicsState } from './getPdfGraphicsState';
import { getPdfPolygonPathOperators } from './drawPdfPolygons';
import { getPdfGradientGeometry } from './getPdfGradientGeometry';
import { getPdfRadialShadingPattern } from './getPdfRadialShadingPattern';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { isOpaqueGradientPaint } from './isOpaqueGradientPaint';
import { registerPdfPattern } from './registerPdfPattern';

const getPdfGradientPatternDict = (
  page: PDFPage,
  paint: TGradientPaint,
  fillBounds: TDraftRect,
  pageBounds: TDraftRect,
): Record<string, unknown> => {
  const { context } = page.doc;
  const geometry = getPdfGradientGeometry(paint, fillBounds, pageBounds);

  switch (paint.type) {
    case 'gradient-linear':
      return getPdfAxialShadingPattern(context, paint.stops, geometry);
    case 'gradient-radial':
      return getPdfRadialShadingPattern(context, paint.stops, geometry, paint.radiusRatio);
    default:
      return getPdfFunctionBasedShadingPattern(context, paint.type, paint.stops, geometry, paint.radiusRatio ?? 1, pageBounds);
  }
};

export const drawPdfGradientPolygons = (
  page: PDFPage,
  paint: TGradientPaint,
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
  nodeBounds: TDraftRect | null = null,
): void => {
  const fillBounds = getVectorFillBounds(polygons, nodeBounds);
  const patternName = registerPdfPattern(page, getPdfGradientPatternDict(page, paint, fillBounds, bounds));
  const softMaskState = isOpaqueGradientPaint(paint) ? null : getPdfGradientSoftMaskState(page, paint, polygons, fillBounds, bounds);

  page.pushOperators(
    pushGraphicsState(),
    setGraphicsState(getPdfGraphicsState(page, opacity, graphicsStates)),
    ...(softMaskState ? [setGraphicsState(softMaskState)] : []),
    PDFOperator.of(PDFOperatorNames.NonStrokingColorspace, [PDFName.of('Pattern')]),
    PDFOperator.of(PDFOperatorNames.NonStrokingColorN, [patternName]),
    ...getPdfPolygonPathOperators(polygons, bounds),
    PDFOperator.of(PDFOperatorNames.FillEvenOdd),
    popGraphicsState(),
  );
};
