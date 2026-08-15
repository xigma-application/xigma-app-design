import { RefObject } from 'react';

// utils
import { handlePointerUp } from '../handlePointerUp';

describe('handlePointerUp', () => {
  it('should clear the anchor index', () => {
    // mock
    const anchorIndexRef: RefObject<number | null> = { current: 3 };

    // before
    handlePointerUp(anchorIndexRef);

    // result
    expect(anchorIndexRef.current).toBeNull();
  });
});
