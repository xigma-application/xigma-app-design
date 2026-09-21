// others
import { EXPORT_SCALE_MENU_OPTIONS } from '../../constants';
import { getExportScaleOptions } from '../getExportScaleOptions';

describe('getExportScaleOptions', () => {
  it('should map every scale preset to a dropdown option using the given label getter', () => {
    // before
    const options = getExportScaleOptions((scale) => `label-${scale}`);

    // result
    expect(options).toEqual(EXPORT_SCALE_MENU_OPTIONS.map((scale) => ({ label: `label-${scale}`, value: scale })));
  });
});
