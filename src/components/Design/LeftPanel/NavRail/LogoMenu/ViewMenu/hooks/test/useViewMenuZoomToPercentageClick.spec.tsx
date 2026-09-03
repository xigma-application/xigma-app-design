import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useViewMenuZoomToPercentageClick } from '../useViewMenuZoomToPercentageClick';

// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

describe('useViewMenuZoomToPercentageClick', () => {
  it('should set the zoom to the given percentage when called', () => {
    // mock
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useViewMenuZoomToPercentageClick(), { wrapper });

    // action
    result.current(2)();

    // result
    expect(selectViewport(store.getState()).zoom).toBe(2);
  });
});
