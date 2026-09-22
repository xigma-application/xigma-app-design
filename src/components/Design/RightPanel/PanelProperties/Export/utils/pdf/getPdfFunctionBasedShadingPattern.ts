import { PDFContext } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';
import { TPdfGradientGeometry } from './getPdfGradientGeometry';

// utils
import { getPdfGradientColorLookupProgram } from './getPdfGradientColorLookupProgram';
import { getPdfGradientGeometryProgram } from './getPdfGradientGeometryProgram';

export const getPdfFunctionBasedShadingPattern = (
  context: PDFContext,
  gradientType: 'gradient-angular' | 'gradient-diamond',
  stops: TGradientStop[],
  geometry: TPdfGradientGeometry,
  radiusRatio: number,
  bounds: TDraftRect,
): Record<string, unknown> => {
  const program = `{ ${getPdfGradientGeometryProgram(gradientType, geometry, radiusRatio)} ${getPdfGradientColorLookupProgram(stops)} }`;
  const functionRef = context.register(
    context.stream(program, { Domain: [0, bounds.width, 0, bounds.height], FunctionType: 4, Range: [0, 1, 0, 1, 0, 1] } as never),
  );

  return {
    PatternType: 2,
    Shading: {
      ColorSpace: 'DeviceRGB',
      Domain: [0, bounds.width, 0, bounds.height],
      Function: functionRef,
      ShadingType: 1,
    },
  };
};
