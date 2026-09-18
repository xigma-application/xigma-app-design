// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getStrokeAlignOptions } from '../getStrokeAlignOptions';

describe('getStrokeAlignOptions', () => {
  it('should list inside, center and outside in that order with translated labels', () => {
    // action
    const options = getStrokeAlignOptions((strokeAlign) => `label:${strokeAlign}`);

    // result
    expect(options).toEqual([
      { label: `label:${StrokeAlign.inside}`, value: StrokeAlign.inside },
      { label: `label:${StrokeAlign.center}`, value: StrokeAlign.center },
      { label: `label:${StrokeAlign.outside}`, value: StrokeAlign.outside },
    ]);
  });
});
