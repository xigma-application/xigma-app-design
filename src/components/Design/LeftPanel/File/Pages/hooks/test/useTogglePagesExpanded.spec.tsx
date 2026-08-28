import { KeyboardEvent, MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useTogglePagesExpanded } from '../useTogglePagesExpanded';

describe('useTogglePagesExpanded', () => {
  it('should start collapsed', () => {
    // before
    const { result } = renderHook(() => useTogglePagesExpanded());

    // result
    expect(result.current.isExpanded).toBe(false);
  });

  it('should force expansion when expand is called and stay expanded on a second call', () => {
    // before
    const { rerender, result } = renderHook(() => useTogglePagesExpanded());

    // action
    result.current.expand();
    rerender();

    // result
    expect(result.current.isExpanded).toBe(true);

    // action
    result.current.expand();
    rerender();

    // result
    expect(result.current.isExpanded).toBe(true);
  });

  it('should toggle isExpanded when handleToggleClick is called', () => {
    // before
    const { rerender, result } = renderHook(() => useTogglePagesExpanded());

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
    const { rerender, result } = renderHook(() => useTogglePagesExpanded());
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
    const { rerender, result } = renderHook(() => useTogglePagesExpanded());
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
    const { rerender, result } = renderHook(() => useTogglePagesExpanded());
    const preventDefault = vi.fn();

    // action
    result.current.handleToggleKeyDown({ key: 'Tab', preventDefault } as unknown as KeyboardEvent<HTMLElement>);
    rerender();

    // result
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.isExpanded).toBe(false);
  });

  it('should stop propagation on handleStopPropagation', () => {
    // before
    const { result } = renderHook(() => useTogglePagesExpanded());
    const stopPropagation = vi.fn();

    // action
    result.current.handleStopPropagation({ stopPropagation } as unknown as MouseEvent<HTMLElement>);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
