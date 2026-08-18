import { RefObject } from 'react';

// utils
import { setHoverState } from '../setHoverState';

describe('setHoverState', () => {
  it("should apply the className, cursor, and hoverRef's node id", () => {
    // mock
    const canvas = document.createElement('canvas');
    const hoverRef: RefObject<string | null> = { current: null };
    const setClassName = vi.fn();

    // before
    setHoverState(canvas, hoverRef, setClassName, 'radius', 'text', 'node-1');

    // result
    expect(setClassName).toHaveBeenCalledWith('radius');
    expect(canvas.style.cursor).toBe('text');
    expect(hoverRef.current).toBe('node-1');
  });

  it('should apply a null className and nodeId with an empty cursor', () => {
    // mock
    const canvas = document.createElement('canvas');
    const hoverRef: RefObject<string | null> = { current: 'previous-node' };
    const setClassName = vi.fn();

    // before
    setHoverState(canvas, hoverRef, setClassName, null, '', null);

    // result
    expect(setClassName).toHaveBeenCalledWith(null);
    expect(canvas.style.cursor).toBe('');
    expect(hoverRef.current).toBeNull();
  });
});
