import { renderHook } from '@testing-library/react';

// hooks
import { useDropdownHoverOption } from '../useDropdownHoverOption';

const options = [
  { label: 'Hex', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
];

describe('useDropdownHoverOption', () => {
  it('should call onHoverOption with null while closed', () => {
    // mock
    const onHoverOption = vi.fn();

    // action
    renderHook(() => useDropdownHoverOption(options, 0, false, onHoverOption));

    // result
    expect(onHoverOption).toHaveBeenCalledWith(null);
  });

  it('should call onHoverOption with the highlighted option value while open', () => {
    // mock
    const onHoverOption = vi.fn();

    // action
    renderHook(() => useDropdownHoverOption(options, 1, true, onHoverOption));

    // result
    expect(onHoverOption).toHaveBeenCalledWith('rgb');
  });

  it('should call onHoverOption with null when open but the highlighted index is out of range', () => {
    // mock
    const onHoverOption = vi.fn();

    // action
    renderHook(() => useDropdownHoverOption([], 0, true, onHoverOption));

    // result
    expect(onHoverOption).toHaveBeenCalledWith(null);
  });

  it('should call onHoverOption again only when the hovered value actually changes', () => {
    // mock
    const onHoverOption = vi.fn();

    // before
    const { rerender } = renderHook(({ highlightedIndex }) => useDropdownHoverOption(options, highlightedIndex, true, onHoverOption), {
      initialProps: { highlightedIndex: 0 },
    });

    onHoverOption.mockClear();

    // action — same highlighted index, same resolved value
    rerender({ highlightedIndex: 0 });

    // result
    expect(onHoverOption).not.toHaveBeenCalled();

    // action
    rerender({ highlightedIndex: 1 });

    // result
    expect(onHoverOption).toHaveBeenCalledWith('rgb');
  });

  it('should not throw when no onHoverOption callback is provided', () => {
    // action
    const render = (): ReturnType<typeof renderHook> => renderHook(() => useDropdownHoverOption(options, 0, true, undefined));

    // result
    expect(render).not.toThrow();
  });
});
