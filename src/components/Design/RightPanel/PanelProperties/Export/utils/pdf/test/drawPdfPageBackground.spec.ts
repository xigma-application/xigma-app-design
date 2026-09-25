import { PDFPage, rgb } from 'pdf-lib';

// utils
import { drawPdfPageBackground } from '../drawPdfPageBackground';

describe('drawPdfPageBackground', () => {
  it('should fill the whole page with the background color and opacity', () => {
    // mock
    const page = { drawRectangle: vi.fn() } as unknown as PDFPage;

    // before
    drawPdfPageBackground(page, { height: 20, width: 40, x: 5, y: 5 }, { color: '#ff0000', opacity: 50, type: 'solid' });

    // result
    expect(page.drawRectangle).toHaveBeenCalledWith({ color: rgb(1, 0, 0), height: 20, opacity: 0.5, width: 40, x: 0, y: 0 });
  });
});
