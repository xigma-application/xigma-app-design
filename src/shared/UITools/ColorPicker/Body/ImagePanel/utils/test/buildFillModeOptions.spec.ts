import i18n from 'i18next';

// utils
import { buildFillModeOptions } from '../buildFillModeOptions';

const t = i18n.t;

describe('buildFillModeOptions', () => {
  it('should build the four fill-mode options in Fill/Fit/Crop/Tile order, with translated labels', () => {
    // action
    const options = buildFillModeOptions(t);

    // result
    expect(options).toEqual([
      { label: 'Fill', value: 'fill' },
      { label: 'Fit', value: 'fit' },
      { label: 'Crop', value: 'crop' },
      { label: 'Tile', value: 'tile' },
    ]);
  });
});
