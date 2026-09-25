import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useTreeItemHover } from '../useTreeItemHover';

const canvasRefs = createCanvasRefs();

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
);

describe('useTreeItemHover behaviors', () => {
  it('should mark the layer as hovered in the layers tree on mouse enter', () => {
    // before
    const { result } = renderHook(() => useTreeItemHover('node-1'), { wrapper });

    // action
    result.current.onMouseEnter();

    // result
    expect(canvasRefs.hover.layersTreeHoverRef.current).toBe('node-1');
  });

  it('should clear the layers tree hover on mouse leave', () => {
    // mock
    canvasRefs.hover.layersTreeHoverRef.current = 'node-1';

    // before
    const { result } = renderHook(() => useTreeItemHover('node-1'), { wrapper });

    // action
    result.current.onMouseLeave();

    // result
    expect(canvasRefs.hover.layersTreeHoverRef.current).toBeNull();
  });
});
