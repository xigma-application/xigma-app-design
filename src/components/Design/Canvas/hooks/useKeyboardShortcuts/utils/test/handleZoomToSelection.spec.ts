// others
import { ZOOM_FIT_PADDING_PX } from '../../../../constants';
import { ZOOM_HINT_SELECTION_LABEL_KEY } from 'components/Design/Toolbar/DesignHint/constants';

// store
import { addNode, deleteNode, setDesignHintLabelKey, setSelection, setViewport } from 'store/design/slice';
import { selectActivePage, selectDesignHintLabelKey, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { animateViewport } from '../../../../utils/animateViewport';
import { createCanvasRefs } from '../../../../hooks/useCanvasRefs/createCanvasRefs';
import { getFitViewport } from '../../../../utils/getFitViewport';
import { getRectCenter } from '../../../../utils/getRectCenter';
import { getVisibleCanvasRect } from '../../../../utils/getVisibleCanvasRect';
import { handleZoomToSelection } from '../handleZoomToSelection';

vi.mock('../../../../utils/animateViewport', () => ({ animateViewport: vi.fn() }));

const addFrameNode = (x: number): string => {
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleZoomToSelection', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    vi.mocked(animateViewport).mockClear();
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
    store.dispatch(setDesignHintLabelKey(null));
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
    expect(animateViewport).toHaveBeenCalledWith(store.dispatch, { x: 0, y: 0, zoom: 1 }, expected, getRectCenter(visibleRect));
    expect(selectDesignHintLabelKey(store.getState())).toBe(ZOOM_HINT_SELECTION_LABEL_KEY);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode(0);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomToSelection(store.dispatch, refs);

    // result
    expect(animateViewport).not.toHaveBeenCalled();
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    const selectedId = addFrameNode(0);
    store.dispatch(setSelection([selectedId]));
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomToSelection(store.dispatch, refs);

    // result
    expect(animateViewport).not.toHaveBeenCalled();
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
