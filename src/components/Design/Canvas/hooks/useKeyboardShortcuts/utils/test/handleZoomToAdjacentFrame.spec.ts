// others
import { ZOOM_FIT_PADDING_PX } from '../../../../constants';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../hooks/useCanvasRefs/createCanvasRefs';
import { getFitViewport } from '../../../../utils/getFitViewport';
import { getVisibleCanvasRect } from '../../../../utils/getVisibleCanvasRect';
import { handleZoomToAdjacentFrame } from '../handleZoomToAdjacentFrame';

const addFrameNode = (x: number): void => {
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
      x,
      y: 0,
    }),
  );
};

describe('handleZoomToAdjacentFrame', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should fit the next frame, ordered left to right, from the frame the viewport is currently centered on', () => {
    // mock — viewport centered inside the first frame (x: 0-100)
    addFrameNode(0);
    addFrameNode(300);
    store.dispatch(setViewport({ x: 450, y: 250, zoom: 1 }));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), refs.layout);
    const expected = getFitViewport({ height: 100, width: 100, x: 300, y: 0 }, visibleRect, ZOOM_FIT_PADDING_PX);

    // action
    handleZoomToAdjacentFrame(store.dispatch, refs, 'next');

    // result
    expect(selectViewport(store.getState())).toEqual(expected);
  });

  it('should fit the previous frame, wrapping around from the first to the last', () => {
    // mock — viewport centered inside the first frame (x: 0-100)
    addFrameNode(0);
    addFrameNode(300);
    store.dispatch(setViewport({ x: 450, y: 250, zoom: 1 }));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), refs.layout);
    const expected = getFitViewport({ height: 100, width: 100, x: 300, y: 0 }, visibleRect, ZOOM_FIT_PADDING_PX);

    // action
    handleZoomToAdjacentFrame(store.dispatch, refs, 'previous');

    // result
    expect(selectViewport(store.getState())).toEqual(expected);
  });

  it('should do nothing when there are no frames', () => {
    // mock
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomToAdjacentFrame(store.dispatch, refs, 'next');

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    addFrameNode(0);
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomToAdjacentFrame(store.dispatch, refs, 'next');

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
