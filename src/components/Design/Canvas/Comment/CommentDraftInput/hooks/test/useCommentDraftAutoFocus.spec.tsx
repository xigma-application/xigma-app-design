import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommentDraftAutoFocus } from '../useCommentDraftAutoFocus';

describe('useCommentDraftAutoFocus behaviors', () => {
  it('should not focus the element while still entering', () => {
    // mock
    const element = document.createElement('div');
    const elementRef: RefObject<HTMLElement | null> = { current: element };

    // spy
    const focus = vi.spyOn(element, 'focus');

    // before
    renderHook(() => useCommentDraftAutoFocus(elementRef, true));

    // result
    expect(focus).not.toHaveBeenCalled();
  });

  it('should focus the element once the entrance animation has finished', () => {
    // mock
    const element = document.createElement('div');
    const elementRef: RefObject<HTMLElement | null> = { current: element };

    // spy
    const focus = vi.spyOn(element, 'focus');

    // before
    const { rerender } = renderHook(({ entering }) => useCommentDraftAutoFocus(elementRef, entering), {
      initialProps: { entering: true },
    });

    // action
    rerender({ entering: false });

    // result
    expect(focus).toHaveBeenCalledOnce();
  });

  it('should do nothing when the ref has no element', () => {
    // mock
    const elementRef: RefObject<HTMLElement | null> = { current: null };

    // result
    expect(() => renderHook(() => useCommentDraftAutoFocus(elementRef, false))).not.toThrow();
  });
});
