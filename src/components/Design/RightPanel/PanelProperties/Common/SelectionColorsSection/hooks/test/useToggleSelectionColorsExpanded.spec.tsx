import { KeyboardEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useToggleSelectionColorsExpanded } from '../useToggleSelectionColorsExpanded';

describe('useToggleSelectionColorsExpanded', () => {
  it('should start collapsed', () => {
    // before
    const { result } = renderHook(() => useToggleSelectionColorsExpanded());

    // result
    expect(result.current.isExpanded).toBe(false);
  });

  it('should toggle isExpanded when handleToggleClick is called', () => {
    // before
    const { rerender, result } = renderHook(() => useToggleSelectionColorsExpanded());

    // action
    result.current.handleToggleClick();
    rerender();

    // result
    expect(result.current.isExpanded).toBe(true);

    // action
    result.current.handleToggleClick();
    rerender();

    // result
    expect(result.current.isExpanded).toBe(false);
  });

  it('should toggle isExpanded on Enter', () => {
    // before
    const { rerender, result } = renderHook(() => useToggleSelectionColorsExpanded());
    const preventDefault = vi.fn();

    // action
    result.current.handleToggleKeyDown({ key: 'Enter', preventDefault } as unknown as KeyboardEvent<HTMLElement>);
    rerender();

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isExpanded).toBe(true);
  });

  it('should toggle isExpanded on Space', () => {
    // before
    const { rerender, result } = renderHook(() => useToggleSelectionColorsExpanded());
    const preventDefault = vi.fn();

    // action
    result.current.handleToggleKeyDown({ key: ' ', preventDefault } as unknown as KeyboardEvent<HTMLElement>);
    rerender();

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isExpanded).toBe(true);
  });

  it('should not toggle isExpanded on other keys', () => {
    // before
    const { rerender, result } = renderHook(() => useToggleSelectionColorsExpanded());
    const preventDefault = vi.fn();

    // action
    result.current.handleToggleKeyDown({ key: 'Tab', preventDefault } as unknown as KeyboardEvent<HTMLElement>);
    rerender();

    // result
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.isExpanded).toBe(false);
  });
});
