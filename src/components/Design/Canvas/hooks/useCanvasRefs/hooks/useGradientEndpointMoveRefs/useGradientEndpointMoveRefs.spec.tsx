import { renderHook } from '@testing-library/react';

// hooks
import { useGradientEndpointMoveRefs } from './useGradientEndpointMoveRefs';

describe('useGradientEndpointMoveRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useGradientEndpointMoveRefs());

    // result
    expect(result.current).toEqual({ gradientEndpointMoveDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useGradientEndpointMoveRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.gradientEndpointMoveDragRef).toBe(firstRefs.gradientEndpointMoveDragRef);
  });
});
