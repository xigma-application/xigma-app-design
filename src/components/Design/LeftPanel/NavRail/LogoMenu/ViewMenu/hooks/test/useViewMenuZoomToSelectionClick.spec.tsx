import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useViewMenuZoomToSelectionClick } from '../useViewMenuZoomToSelectionClick';

// others
import { ZOOM_ANIMATION_DURATION_MS } from 'components/Design/Canvas/constants';

// store
import { addNode, deleteNode, setSelection, setViewport } from 'store/design/slice';
import { selectActivePage, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('useViewMenuZoomToSelectionClick', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should fit the current selection when called', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 100,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useViewMenuZoomToSelectionClick(), { wrapper });
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });

    // action
    result.current();
    vi.advanceTimersByTime(ZOOM_ANIMATION_DURATION_MS);

    // result
    expect(selectViewport(store.getState()).zoom).not.toBe(1);

    // cleanup
    vi.useRealTimers();
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useViewMenuZoomToSelectionClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
