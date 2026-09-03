import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useViewMenuZoomToFitClick } from '../useViewMenuZoomToFitClick';

// store
import { addNode, deleteNode, setSelection, setViewport } from 'store/design/slice';
import { selectActivePage, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('useViewMenuZoomToFitClick', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should fit all nodes when called with nothing selected', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 100, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 100, x: 0, y: 0 }),
    );
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useViewMenuZoomToFitClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectViewport(store.getState()).zoom).not.toBe(1);
  });
});
