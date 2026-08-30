import { MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useTreeItemContextMenu } from '../useTreeItemContextMenu';

const contextMenuEvent = (x: number, y: number): MouseEvent =>
  ({ clientX: x, clientY: y, preventDefault: vi.fn() }) as unknown as MouseEvent;

describe('useTreeItemContextMenu', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start closed with a zeroed anchor rect', () => {
    // before
    const { result } = renderHook(() => useTreeItemContextMenu());

    // result
    const rect = result.current.anchorRef.current.getBoundingClientRect();

    expect(result.current.isOpen).toBe(false);
    expect([rect.x, rect.y]).toEqual([0, 0]);
  });

  it('should anchor at the cursor position and block the native menu immediately, but only open on the next tick', () => {
    // mock
    const event = contextMenuEvent(120, 240);

    // before
    const { result } = renderHook(() => useTreeItemContextMenu());

    // result — closed initially
    expect(result.current.isOpen).toBe(false);

    // action
    act(() => result.current.onContextMenu(event));

    // result — anchored and prevented synchronously, but not yet open: opening this same tick would
    // race radix's own outside-interaction detection against the tail of this right-click gesture
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);

    const rect = result.current.anchorRef.current.getBoundingClientRect();

    expect([rect.x, rect.y]).toEqual([120, 240]);

    // action
    act(() => vi.runAllTimers());

    // result
    expect(result.current.isOpen).toBe(true);
  });

  it('should close through onOpenChange', () => {
    // before
    const { result } = renderHook(() => useTreeItemContextMenu());
    act(() => result.current.onContextMenu(contextMenuEvent(0, 0)));
    act(() => vi.runAllTimers());

    // action
    act(() => result.current.onOpenChange(false));

    // result
    expect(result.current.isOpen).toBe(false);
  });
});
