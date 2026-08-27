import { renderHook } from '@testing-library/react';

// hooks
import { useHighlightDropdownOption } from '../useHighlightDropdownOption';

describe('useHighlightDropdownOption', () => {
  it('should call onHighlight with the curried index', () => {
    // mock
    const onHighlight = vi.fn();

    // before
    const { result } = renderHook(() => useHighlightDropdownOption(onHighlight));

    // action
    result.current(2)();

    // result
    expect(onHighlight).toHaveBeenCalledWith(2);
  });
});
