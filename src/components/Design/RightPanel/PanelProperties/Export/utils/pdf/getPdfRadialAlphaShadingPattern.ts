import { PDFContext } from 'pdf-lib';

// types
import { TPdfGradientGeometry } from './getPdfGradientGeometry';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientAlphaFunction } from './getPdfGradientAlphaFunction';

export const getPdfRadialAlphaShadingPattern = (
  context: PDFContext,
  stops: TGradientStop[],
  geometry: TPdfGradientGeometry,
  radiusRatio = 1,
): Record<string, unknown> => ({
  Matrix: [
    geometry.direction.x * geometry.primaryRadius,
    geometry.direction.y * geometry.primaryRadius,
    geometry.perpendicular.x * geometry.primaryRadius * radiusRatio,
    geometry.perpendicular.y * geometry.primaryRadius * radiusRatio,
    geometry.startPage.x,
    geometry.startPage.y,
  ],
  PatternType: 2,
  Shading: {
    ColorSpace: 'DeviceGray',
    Coords: [0, 0, 0, 0, 0, 1],
    Extend: [true, true],
    Function: getPdfGradientAlphaFunction(context, stops),
    ShadingType: 3,
  },
});
