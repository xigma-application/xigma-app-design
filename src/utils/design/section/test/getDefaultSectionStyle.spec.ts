// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getDefaultSectionStyle } from '../getDefaultSectionStyle';

describe('getDefaultSectionStyle', () => {
  it('should give a #444444 fill, a 1px white 10% inside stroke and a 2px corner radius', () => {
    // result
    expect(getDefaultSectionStyle()).toEqual({
      cornerRadius: 2,
      fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 1,
      strokes: [{ color: '#FFFFFF', opacity: 10, type: 'solid' }],
    });
  });

  it('should use the given fill color instead of the default one', () => {
    // result
    expect(getDefaultSectionStyle('#123456').fills).toEqual([{ color: '#123456', opacity: 100, type: 'solid' }]);
  });
});
