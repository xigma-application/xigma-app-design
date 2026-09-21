// utils
import { getActiveColorProfile, setActiveColorProfile } from '../activeColorProfile';

describe('activeColorProfile', () => {
  afterEach(() => {
    setActiveColorProfile('srgb');
  });

  it('should default to srgb', () => {
    expect(getActiveColorProfile()).toBe('srgb');
  });

  it('should report whatever profile was last set', () => {
    // action
    setActiveColorProfile('displayP3');

    // result
    expect(getActiveColorProfile()).toBe('displayP3');
  });
});
