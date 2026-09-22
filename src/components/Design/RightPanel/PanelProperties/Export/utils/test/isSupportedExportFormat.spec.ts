// types
import { ExportFormat } from '../../enums';

// utils
import { isSupportedExportFormat } from '../isSupportedExportFormat';

describe('isSupportedExportFormat', () => {
  it('should support png', () => {
    expect(isSupportedExportFormat(ExportFormat.png)).toBe(true);
  });

  it('should support jpeg', () => {
    expect(isSupportedExportFormat(ExportFormat.jpeg)).toBe(true);
  });

  it('should support pdf', () => {
    expect(isSupportedExportFormat(ExportFormat.pdf)).toBe(true);
  });

  it('should support svg', () => {
    expect(isSupportedExportFormat(ExportFormat.svg)).toBe(true);
  });
});
