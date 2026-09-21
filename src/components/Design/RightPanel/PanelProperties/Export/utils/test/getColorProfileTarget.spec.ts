// types
import { ExportColorProfile } from '../../enums';

// utils
import { getColorProfileTarget } from '../getColorProfileTarget';

describe('getColorProfileTarget', () => {
  it('should map displayP3 to displayP3', () => {
    expect(getColorProfileTarget(ExportColorProfile.displayP3)).toBe('displayP3');
  });

  it('should map srgb to srgb', () => {
    expect(getColorProfileTarget(ExportColorProfile.srgb)).toBe('srgb');
  });

  it('should map srgbSameAsFile to srgb, since this app has no document-level color space to match', () => {
    expect(getColorProfileTarget(ExportColorProfile.srgbSameAsFile)).toBe('srgb');
  });
});
