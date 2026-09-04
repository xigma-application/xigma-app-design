import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useMediaToolHintPlaceAllClick } from '../useMediaToolHintPlaceAllClick';

// store
import { selectActivePage } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmedMedia } from 'components/Design/Canvas/hooks/useDrawMediaTool/utils/loadArmedMedia';

const createWrapper = (refs: ReturnType<typeof createCanvasRefs>): ((props: { children: ReactNode }) => ReactNode) => {
  const Wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <Provider store={store}>
      <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
    </Provider>
  );

  return Wrapper;
};

describe('useMediaToolHintPlaceAllClick', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should place the armed media on the canvas when called', async () => {
    // mock
    const canvas = document.createElement('canvas');

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, left: 0, top: 0, width: 1000 } as DOMRect);

    const armed: TArmedMedia = { naturalHeight: 50, naturalWidth: 100, src: 'blob:armed' };
    const refs = createCanvasRefs({ canvasRef: { current: canvas }, media: { armedRef: { current: armed }, queueRef: { current: [] } } });
    const rootOrderLengthBefore = selectActivePage(store.getState()).rootOrder.length;

    // before
    const { result } = renderHook(() => useMediaToolHintPlaceAllClick(), { wrapper: createWrapper(refs) });

    // action
    result.current();

    // result
    await waitFor(() => {
      expect(selectActivePage(store.getState()).rootOrder.length).toBe(rootOrderLengthBefore + 1);
    });
  });

  it('should do nothing when there is no canvas element yet', () => {
    // mock
    const refs = createCanvasRefs();
    const rootOrderLengthBefore = selectActivePage(store.getState()).rootOrder.length;

    // before
    const { result } = renderHook(() => useMediaToolHintPlaceAllClick(), { wrapper: createWrapper(refs) });

    // action
    result.current();

    // result
    expect(selectActivePage(store.getState()).rootOrder.length).toBe(rootOrderLengthBefore);
  });
});
