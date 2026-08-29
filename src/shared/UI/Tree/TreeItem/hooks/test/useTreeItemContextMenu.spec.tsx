import { MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useTreeItemContextMenu } from '../useTreeItemContextMenu';

const contextMenuEvent = (x: number, y: number): MouseEvent =>
  ({ clientX: x, clientY: y, preventDefault: vi.fn() }) as unknown as MouseEvent;

describe('useTreeItemContextMenu', () => {
  it('should start closed with a zeroed anchor rect', () => {
    // before
    const { result } = renderHook(() => useTreeItemContextMenu());

    // result
    const rect = result.current.anchorRef.current.getBoundingClientRect();

    expect(result.current.isOpen).toBe(false);
    expect([rect.x, rect.y]).toEqual([0, 0]);
  });

  it('should open and anchor at the cursor position while blocking the native menu', () => {
    // mock
    const event = contextMenuEvent(120, 240);

    // before
    const { result } = renderHook(() => useTreeItemContextMenu());

    // result — closed initially
    expect(result.current.isOpen).toBe(false);

    // action
    act(() => result.current.onContextMenu(event));

    // result
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(true);

    const rect = result.current.anchorRef.current.getBoundingClientRect();

    expect([rect.x, rect.y]).toEqual([120, 240]);
  });

  it('should close through onOpenChange', () => {
    // before
    const { result } = renderHook(() => useTreeItemContextMenu());
    act(() => result.current.onContextMenu(contextMenuEvent(0, 0)));

    // action
    act(() => result.current.onOpenChange(false));

    // result
    expect(result.current.isOpen).toBe(false);
  });
});
