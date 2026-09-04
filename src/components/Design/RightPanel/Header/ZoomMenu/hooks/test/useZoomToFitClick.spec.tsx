import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useZoomToFitClick } from '../useZoomToFitClick';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectNodes, selectViewport } from 'store/design/selectors';
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

describe('useZoomToFitClick', () => {
  let nodeId: string;

  beforeEach(() => {
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rect',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 500,
        y: 500,
      }),
    );
    nodeId = Object.keys(selectNodes(store.getState())).at(-1) as string;
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  afterEach(() => {
    store.dispatch(deleteNode(nodeId));
  });

  it('should animate the viewport to fit the scene when called', () => {
    // mock
    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => (now += 1000));
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(now);

      return 0;
    });

    // before
    const { result } = renderHook(() => useZoomToFitClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectViewport(store.getState())).not.toEqual({ x: 0, y: 0, zoom: 1 });

    nowSpy.mockRestore();
    rafSpy.mockRestore();
  });
});
