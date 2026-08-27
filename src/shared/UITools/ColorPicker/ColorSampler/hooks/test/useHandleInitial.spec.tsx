import { renderHook } from '@testing-library/react';

// hooks
import { useHandleInitial } from '../useHandleInitial';

describe('useHandleInitial', () => {
  it('should disable pointer events on the body while mounted', () => {
    // before
    renderHook(() => useHandleInitial());

    // result
    expect(document.body.style.pointerEvents).toBe('none');
  });

  it('should restore pointer events on the body when unmounted', () => {
    // before
    const { unmount } = renderHook(() => useHandleInitial());

    unmount();

    // result
    expect(document.body.style.pointerEvents).toBe('all');
  });
});
