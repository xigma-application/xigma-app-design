import { PDFContext } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';
import { TPdfGradientGeometry } from './getPdfGradientGeometry';

// utils
import { getPdfAxialAlphaShadingPattern } from './getPdfAxialAlphaShadingPattern';
import { getPdfFunctionBasedAlphaShadingPattern } from './getPdfFunctionBasedAlphaShadingPattern';
import { getPdfRadialAlphaShadingPattern } from './getPdfRadialAlphaShadingPattern';

export const getPdfGradientAlphaPatternDict = (
  context: PDFContext,
  paint: TGradientPaint,
  geometry: TPdfGradientGeometry,
  bounds: TDraftRect,
): Record<string, unknown> => {
  switch (paint.type) {
    case 'gradient-linear':
      return getPdfAxialAlphaShadingPattern(context, paint.stops, geometry);
    case 'gradient-radial':
      return getPdfRadialAlphaShadingPattern(context, paint.stops, geometry, paint.radiusRatio);
    default:
      return getPdfFunctionBasedAlphaShadingPattern(context, paint.type, paint.stops, geometry, paint.radiusRatio ?? 1, bounds);
  }
};
