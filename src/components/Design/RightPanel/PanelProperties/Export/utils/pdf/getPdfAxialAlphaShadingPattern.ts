import { PDFContext } from 'pdf-lib';

// types
import { TPdfGradientGeometry } from './getPdfGradientGeometry';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientAlphaFunction } from './getPdfGradientAlphaFunction';

export const getPdfAxialAlphaShadingPattern = (
  context: PDFContext,
  stops: TGradientStop[],
  geometry: TPdfGradientGeometry,
): Record<string, unknown> => ({
  PatternType: 2,
  Shading: {
    ColorSpace: 'DeviceGray',
    Coords: [geometry.startPage.x, geometry.startPage.y, geometry.endPage.x, geometry.endPage.y],
    Extend: [true, true],
    Function: getPdfGradientAlphaFunction(context, stops),
    ShadingType: 2,
  },
});
