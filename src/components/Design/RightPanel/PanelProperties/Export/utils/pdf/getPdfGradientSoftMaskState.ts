import { PDFDict, PDFName, PDFOperator, PDFOperatorNames, PDFPage } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfGradientAlphaPatternDict } from './getPdfGradientAlphaPatternDict';
import { getPdfGradientGeometry } from './getPdfGradientGeometry';
import { getPdfPolygonPathOperators } from './drawPdfPolygons';
import { registerPdfPatternInDict } from './registerPdfPatternInDict';

export const getPdfGradientSoftMaskState = (
  page: PDFPage,
  paint: TGradientPaint,
  polygons: TPoint[][],
  fillBounds: TDraftRect,
  pageBounds: TDraftRect,
): PDFName => {
  const { context } = page.doc;
  const geometry = getPdfGradientGeometry(paint, fillBounds, pageBounds);
  const alphaPatternDict = getPdfGradientAlphaPatternDict(context, paint, geometry, pageBounds);
  const resources = PDFDict.withContext(context);
  const patternName = registerPdfPatternInDict(resources, alphaPatternDict);

  const content = [
    PDFOperator.of(PDFOperatorNames.NonStrokingColorspace, [PDFName.of('Pattern')]),
    PDFOperator.of(PDFOperatorNames.NonStrokingColorN, [patternName]),
    ...getPdfPolygonPathOperators(polygons, pageBounds),
    PDFOperator.of(PDFOperatorNames.FillEvenOdd),
  ];

  const formRef = context.register(
    context.formXObject(content, {
      BBox: [0, 0, pageBounds.width, pageBounds.height],
      Group: { CS: 'DeviceGray', S: 'Transparency', Type: 'Group' },
      Resources: resources,
    } as never),
  );
  const extGStateRef = context.register(context.obj({ SMask: { G: formRef, S: 'Luminosity', Type: 'Mask' }, Type: 'ExtGState' } as never));

  return page.node.newExtGState('XigmaSoftMask', extGStateRef);
};
