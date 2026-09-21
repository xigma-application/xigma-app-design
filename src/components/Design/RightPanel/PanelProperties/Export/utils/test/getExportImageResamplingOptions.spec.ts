// others
import { EXPORT_IMAGE_RESAMPLING_MENU_OPTIONS } from '../../constants';
import { getExportImageResamplingOptions } from '../getExportImageResamplingOptions';

describe('getExportImageResamplingOptions', () => {
  it('should map every image resampling option to a dropdown option using the given label getter', () => {
    // before
    const options = getExportImageResamplingOptions((imageResampling) => `label-${imageResampling}`);

    // result
    expect(options).toEqual(
      EXPORT_IMAGE_RESAMPLING_MENU_OPTIONS.map((imageResampling) => ({ label: `label-${imageResampling}`, value: imageResampling })),
    );
  });
});
