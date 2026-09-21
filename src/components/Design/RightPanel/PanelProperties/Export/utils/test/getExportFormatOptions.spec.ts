// others
import { EXPORT_FORMAT_MENU_OPTIONS } from '../../constants';
import { getExportFormatOptions } from '../getExportFormatOptions';

describe('getExportFormatOptions', () => {
  it('should map every export format to a dropdown option using the given label getter', () => {
    // before
    const options = getExportFormatOptions((format) => `label-${format}`);

    // result
    expect(options).toEqual(EXPORT_FORMAT_MENU_OPTIONS.map((format) => ({ label: `label-${format}`, value: format })));
  });
});
