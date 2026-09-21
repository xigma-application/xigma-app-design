// others
import { DEFAULT_EXPORT_SETTING } from '../../constants';

// types
import { ExportFormat } from '../../enums';
import { TExportSetting } from '../../types';

// utils
import { getExportFileNames } from '../getExportFileNames';

const setting = (overrides: Partial<TExportSetting> = {}): TExportSetting => ({ ...DEFAULT_EXPORT_SETTING, ...overrides });

describe('getExportFileNames', () => {
  it('should name a single row after the node and its format extension', () => {
    // action
    const result = getExportFileNames('Icon', [setting({ format: ExportFormat.png })]);

    // result
    expect(result).toEqual(['Icon.png']);
  });

  it('should append the row suffix before the extension', () => {
    // action
    const result = getExportFileNames('Icon', [setting({ format: ExportFormat.png, suffix: '@2x' })]);

    // result
    expect(result).toEqual(['Icon@2x.png']);
  });

  it('should keep distinct rows (different suffix/format) with their own natural names', () => {
    // action
    const result = getExportFileNames('Icon', [
      setting({ format: ExportFormat.png }),
      setting({ format: ExportFormat.jpeg }),
      setting({ format: ExportFormat.png, suffix: '@2x' }),
    ]);

    // result
    expect(result).toEqual(['Icon.png', 'Icon.jpg', 'Icon@2x.png']);
  });

  it('should number a later row that would otherwise collide with an earlier one', () => {
    // action
    const result = getExportFileNames('Icon', [setting({ format: ExportFormat.png }), setting({ format: ExportFormat.png })]);

    // result
    expect(result).toEqual(['Icon.png', 'Icon (2).png']);
  });

  it('should keep numbering forward across more than one collision', () => {
    // action
    const result = getExportFileNames('Icon', [
      setting({ format: ExportFormat.png }),
      setting({ format: ExportFormat.png }),
      setting({ format: ExportFormat.png }),
    ]);

    // result
    expect(result).toEqual(['Icon.png', 'Icon (2).png', 'Icon (3).png']);
  });
});
