// others
import { ZOOM_FIT_PADDING_PX } from '../../../../constants';

// store
import { addNode, deleteNode, setSelection, setViewport } from 'store/design/slice';
import { selectActivePage, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../hooks/useCanvasRefs/createCanvasRefs';
import { getFitViewport } from '../../../../utils/getFitViewport';
import { getVisibleCanvasRect } from '../../../../utils/getVisibleCanvasRect';
import { handleZoomToSelection } from '../handleZoomToSelection';

const addFrameNode = (x: number): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 100, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 100, x, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleZoomToSelection', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should fit the current selection, ignoring unselected nodes', () => {
    // mock
    addFrameNode(0);
    const selectedId = addFrameNode(300);
    store.dispatch(setSelection([selectedId]));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), 0, 0);
    const expected = getFitViewport({ height: 100, width: 100, x: 300, y: 0 }, visibleRect, ZOOM_FIT_PADDING_PX);

    // action
    handleZoomToSelection(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState())).toEqual(expected);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode(0);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomToSelection(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    const selectedId = addFrameNode(0);
    store.dispatch(setSelection([selectedId]));
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomToSelection(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
