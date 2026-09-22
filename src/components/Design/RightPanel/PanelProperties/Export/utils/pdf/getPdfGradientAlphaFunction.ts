import { PDFContext, PDFRef } from 'pdf-lib';

// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientStitchingFunction } from './getPdfGradientStitchingFunction';

export const getPdfGradientAlphaFunction = (context: PDFContext, stops: TGradientStop[]): PDFRef =>
  getPdfGradientStitchingFunction(context, stops, (stop) => [stop.opacity / 100]);
