// types
import { ExportFormat } from '../../enums';

// utils
import { isRasterExportFormat } from '../isRasterExportFormat';

describe('isRasterExportFormat', () => {
  it('should treat png as a raster format', () => {
    expect(isRasterExportFormat(ExportFormat.png)).toBe(true);
  });

  it('should treat jpeg as a raster format', () => {
    expect(isRasterExportFormat(ExportFormat.jpeg)).toBe(true);
  });

  it('should not treat svg as a raster format', () => {
    expect(isRasterExportFormat(ExportFormat.svg)).toBe(false);
  });

  it('should not treat pdf as a raster format', () => {
    expect(isRasterExportFormat(ExportFormat.pdf)).toBe(false);
  });
});
