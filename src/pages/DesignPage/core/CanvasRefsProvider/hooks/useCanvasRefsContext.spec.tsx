import { renderHook } from '@testing-library/react';

// components
import CanvasRefsProvider from '../CanvasRefsProvider';

// hooks
import { useCanvasRefsContext } from './useCanvasRefsContext';

describe('useCanvasRefsContext', () => {
  it('should throw when used outside a CanvasRefsProvider', () => {
    // result
    expect(() => renderHook(() => useCanvasRefsContext())).toThrow('useCanvasRefsContext must be used within a CanvasRefsProvider');
  });

  it('should return the same refs object on every render when used inside a CanvasRefsProvider', () => {
    // before
    const { rerender, result } = renderHook(() => useCanvasRefsContext(), {
      wrapper: ({ children }) => <CanvasRefsProvider>{children}</CanvasRefsProvider>,
    });

    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.canvasRef.current).toBeNull();
  });
});
