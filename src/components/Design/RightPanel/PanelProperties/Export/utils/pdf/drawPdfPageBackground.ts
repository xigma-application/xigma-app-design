import { PDFPage, rgb } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TSolidPaint } from 'types/design/paint/types';

// utils
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';

export const drawPdfPageBackground = (page: PDFPage, bounds: TDraftRect, backgroundPaint: TSolidPaint): void => {
  const [r, g, b] = hexToRgbFloat(backgroundPaint.color);

  page.drawRectangle({
    color: rgb(r, g, b),
    height: bounds.height,
    opacity: backgroundPaint.opacity / 100,
    width: bounds.width,
    x: 0,
    y: 0,
  });
};
