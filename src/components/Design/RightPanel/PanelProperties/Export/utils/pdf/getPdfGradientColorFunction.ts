import { PDFContext, PDFRef } from 'pdf-lib';

// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientStitchingFunction } from './getPdfGradientStitchingFunction';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';

export const getPdfGradientColorFunction = (context: PDFContext, stops: TGradientStop[]): PDFRef =>
  getPdfGradientStitchingFunction(context, stops, (stop) => [...hexToRgbFloat(stop.color)]);
