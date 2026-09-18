// utils
import { getIsResumingImageFocus } from '../getIsResumingImageFocus';

describe('getIsResumingImageFocus', () => {
  it('should be true for a media fill whose node and paint index match the focus marker', () => {
    expect(getIsResumingImageFocus(true, { nodeId: 'n', paintIndex: 1 }, 'n', 1)).toBe(true);
  });

  it('should be false for a non-media fill even when the marker matches', () => {
    expect(getIsResumingImageFocus(false, { nodeId: 'n', paintIndex: 1 }, 'n', 1)).toBe(false);
  });

  it('should be false when there is no focus marker', () => {
    expect(getIsResumingImageFocus(true, null, 'n', 1)).toBe(false);
  });

  it('should be false when the node differs', () => {
    expect(getIsResumingImageFocus(true, { nodeId: 'other', paintIndex: 1 }, 'n', 1)).toBe(false);
  });

  it('should be false when the paint index differs', () => {
    expect(getIsResumingImageFocus(true, { nodeId: 'n', paintIndex: 0 }, 'n', 1)).toBe(false);
  });
});
