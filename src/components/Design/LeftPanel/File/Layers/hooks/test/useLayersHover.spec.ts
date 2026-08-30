import { renderHook } from '@testing-library/react';

// hooks
import { useLayersHover } from '../useLayersHover';

describe('useLayersHover', () => {
  it('should start not hovered', () => {
    // before
    const { result } = renderHook(() => useLayersHover());

    // result
    expect(result.current.isHovered).toBe(false);
  });

  it('should flip isHovered on mouse enter and back on mouse leave', () => {
    // before
    const { rerender, result } = renderHook(() => useLayersHover());

    // action
    result.current.onMouseEnter();
    rerender();

    // result
    expect(result.current.isHovered).toBe(true);

    // action
    result.current.onMouseLeave();
    rerender();

    // result
    expect(result.current.isHovered).toBe(false);
  });
});
