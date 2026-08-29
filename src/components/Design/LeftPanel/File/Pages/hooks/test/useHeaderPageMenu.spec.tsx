import { MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useHeaderPageMenu } from '../useHeaderPageMenu';

const contextMenuEvent = (): MouseEvent => ({ clientX: 5, clientY: 6, preventDefault: vi.fn() }) as unknown as MouseEvent;

describe('useHeaderPageMenu', () => {
  it('should open the menu on right-click while collapsed', () => {
    // before
    const { result } = renderHook(() => useHeaderPageMenu(true));

    // action
    act(() => result.current.onContextMenu(contextMenuEvent()));

    // result
    expect(result.current.isOpen).toBe(true);
  });

  it('should ignore right-click while expanded', () => {
    // before
    const { result } = renderHook(() => useHeaderPageMenu(false));

    // action
    act(() => result.current.onContextMenu(contextMenuEvent()));

    // result
    expect(result.current.isOpen).toBe(false);
  });
});
