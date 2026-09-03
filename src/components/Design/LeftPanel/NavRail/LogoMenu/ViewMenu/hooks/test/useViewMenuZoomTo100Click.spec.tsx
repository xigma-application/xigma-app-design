import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useViewMenuZoomTo100Click } from '../useViewMenuZoomTo100Click';

// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

describe('useViewMenuZoomTo100Click', () => {
  it('should reset the zoom to 100% when called', () => {
    // mock
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    store.dispatch(setViewport({ x: 100, y: 100, zoom: 4 }));

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useViewMenuZoomTo100Click(), { wrapper });

    // action
    result.current();

    // result
    expect(selectViewport(store.getState()).zoom).toBe(1);
  });
});
