// utils
import { getMinMaxIcon } from '../getMinMaxIcon';

describe('getMinMaxIcon', () => {
  it('should return undefined when neither hasMin nor hasMax is set', () => {
    expect(getMinMaxIcon(true, false, false)).toBeUndefined();
  });

  it('should return WidthRestricted for the width axis when hasMin is set', () => {
    expect(getMinMaxIcon(true, true, false)).toBe('WidthRestricted');
  });

  it('should return WidthRestricted for the width axis when hasMax is set', () => {
    expect(getMinMaxIcon(true, false, true)).toBe('WidthRestricted');
  });

  it('should return HeightRestricted for the height axis when hasMin is set', () => {
    expect(getMinMaxIcon(false, true, false)).toBe('HeightRestricted');
  });

  it('should return HeightRestricted for the height axis when hasMax is set', () => {
    expect(getMinMaxIcon(false, false, true)).toBe('HeightRestricted');
  });
});
