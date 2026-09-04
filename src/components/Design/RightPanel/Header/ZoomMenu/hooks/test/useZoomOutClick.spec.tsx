import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useZoomOutClick } from '../useZoomOutClick';

// store
import { selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store } from 'store';

const canvas = document.createElement('canvas');

vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);

const canvasRefs = createCanvasRefs({ canvasRef: { current: canvas } });

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
  </Provider>
);

describe('useZoomOutClick', () => {
  it('should decrease the viewport zoom when called', () => {
    // mock
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    // before
    const { result } = renderHook(() => useZoomOutClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectViewport(store.getState()).zoom).toBeLessThan(1);
  });
});
