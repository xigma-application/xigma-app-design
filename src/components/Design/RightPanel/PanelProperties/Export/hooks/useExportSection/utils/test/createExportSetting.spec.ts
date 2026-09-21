// others
import { DEFAULT_EXPORT_SETTING } from '../../../../constants';
import { createExportSetting } from '../createExportSetting';

describe('createExportSetting', () => {
  it('should return a copy of the default export setting', () => {
    // before
    const setting = createExportSetting();

    // result
    expect(setting).toEqual(DEFAULT_EXPORT_SETTING);
    expect(setting).not.toBe(DEFAULT_EXPORT_SETTING);
  });
});
