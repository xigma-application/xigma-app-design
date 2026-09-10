// utils
import { getRemoveBoundsLabelKey } from '../getRemoveBoundsLabelKey';

describe('getRemoveBoundsLabelKey', () => {
  it('should return the combined width key when both bounds are shown', () => {
    expect(getRemoveBoundsLabelKey(true, true, true)).toBe('removeMinMaxWidth');
  });

  it('should return the combined height key when both bounds are shown', () => {
    expect(getRemoveBoundsLabelKey(false, true, true)).toBe('removeMinMaxHeight');
  });

  it('should return the max width key when only max is shown', () => {
    expect(getRemoveBoundsLabelKey(true, false, true)).toBe('removeMaxWidth');
  });

  it('should return the max height key when only max is shown', () => {
    expect(getRemoveBoundsLabelKey(false, false, true)).toBe('removeMaxHeight');
  });

  it('should return the min width key when only min is shown', () => {
    expect(getRemoveBoundsLabelKey(true, true, false)).toBe('removeMinWidth');
  });

  it('should return the min height key when only min is shown', () => {
    expect(getRemoveBoundsLabelKey(false, true, false)).toBe('removeMinHeight');
  });
});
