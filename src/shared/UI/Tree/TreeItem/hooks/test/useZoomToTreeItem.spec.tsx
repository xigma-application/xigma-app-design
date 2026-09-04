import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useZoomToTreeItem } from '../useZoomToTreeItem';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectNodes, selectSelectedIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const canvas = document.createElement('canvas');

vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);

const canvasRefs = createCanvasRefs({ canvasRef: { current: canvas } });

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
  </Provider>
);

describe('useZoomToTreeItem', () => {
  let nodeId: string;

  beforeEach(() => {
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    nodeId = Object.keys(selectNodes(store.getState())).at(-1) as string;
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  afterEach(() => {
    store.dispatch(deleteNode(nodeId));
  });

  it('should select the node and zoom the viewport to it when called', () => {
    // mock
    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => (now += 1000));
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(now);

      return 0;
    });

    // before
    const { result } = renderHook(() => useZoomToTreeItem(nodeId), { wrapper });

    // action
    result.current();

    // result
    expect(selectSelectedIds(store.getState())).toEqual([nodeId]);
    expect(selectViewport(store.getState())).not.toEqual({ x: 0, y: 0, zoom: 1 });

    nowSpy.mockRestore();
    rafSpy.mockRestore();
  });
});
