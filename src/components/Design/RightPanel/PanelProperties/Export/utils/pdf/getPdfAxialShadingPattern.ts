import { PDFContext } from 'pdf-lib';

// types
import { TPdfGradientGeometry } from './getPdfGradientGeometry';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientColorFunction } from './getPdfGradientColorFunction';

export const getPdfAxialShadingPattern = (
  context: PDFContext,
  stops: TGradientStop[],
  geometry: TPdfGradientGeometry,
): Record<string, unknown> => ({
  PatternType: 2,
  Shading: {
    ColorSpace: 'DeviceRGB',
    Coords: [geometry.startPage.x, geometry.startPage.y, geometry.endPage.x, geometry.endPage.y],
    Extend: [true, true],
    Function: getPdfGradientColorFunction(context, stops),
    ShadingType: 2,
  },
});
