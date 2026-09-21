// others
import { EXPORT_COLOR_PROFILE_MENU_OPTIONS } from '../../constants';
import { getExportColorProfileOptions } from '../getExportColorProfileOptions';

describe('getExportColorProfileOptions', () => {
  it('should map every color profile to a dropdown option using the given label getter', () => {
    // before
    const options = getExportColorProfileOptions((colorProfile) => `label-${colorProfile}`);

    // result
    expect(options).toEqual(
      EXPORT_COLOR_PROFILE_MENU_OPTIONS.map((colorProfile) => ({ label: `label-${colorProfile}`, value: colorProfile })),
    );
  });
});
