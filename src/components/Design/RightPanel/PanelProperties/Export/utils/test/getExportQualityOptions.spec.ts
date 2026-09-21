// others
import { EXPORT_QUALITY_MENU_OPTIONS } from '../../constants';
import { getExportQualityOptions } from '../getExportQualityOptions';

describe('getExportQualityOptions', () => {
  it('should map every quality option to a dropdown option using the given label getter', () => {
    // before
    const options = getExportQualityOptions((quality) => `label-${quality}`);

    // result
    expect(options).toEqual(EXPORT_QUALITY_MENU_OPTIONS.map((quality) => ({ label: `label-${quality}`, value: quality })));
  });
});
