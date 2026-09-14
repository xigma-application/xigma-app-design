import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useIsPointerOverGradientHandle } from '../useIsPointerOverGradientHandle';

describe('useIsPointerOverGradientHandle', () => {
  it('should return false when no gradient stop is hovered', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
    );

    // before
    const { result } = renderHook(() => useIsPointerOverGradientHandle(), { wrapper });

    // result
    expect(result.current()).toBe(false);
  });

  it('should return true once the hover ref is set, without needing a re-render', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
    );

    // before
    const { result } = renderHook(() => useIsPointerOverGradientHandle(), { wrapper });

    canvasRefs.hover.hoveredGradientStopIndexRef.current = 1;

    // result — reads the ref live, not a snapshot taken at render time
    expect(result.current()).toBe(true);
  });

  it('should return true while a gradient stop drag is in progress, even if the cursor has strayed off the stop', () => {
    // mock — the pointer wandered off the swatch mid-drag, so the hover ref alone would already be null
    const canvasRefs = createCanvasRefs();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
    );

    // before
    const { result } = renderHook(() => useIsPointerOverGradientHandle(), { wrapper });

    canvasRefs.gradientStop.gradientStopDragRef.current = { color: '#000000', draggedStopIndex: 0, nodeId: 'node-a', opacity: 100, paintIndex: 0 };

    // result
    expect(result.current()).toBe(true);
  });

  it('should return true while hovering the gradient guide line, not just an existing stop', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
    );

    // before
    const { result } = renderHook(() => useIsPointerOverGradientHandle(), { wrapper });

    canvasRefs.hover.hoveredGradientLinePositionRef.current = 0.5;

    // result
    expect(result.current()).toBe(true);
  });
});
