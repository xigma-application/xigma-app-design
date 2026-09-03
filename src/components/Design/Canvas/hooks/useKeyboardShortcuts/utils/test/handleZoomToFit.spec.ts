// others
import { ZOOM_FIT_PADDING_PX } from '../../../../constants';
import { ZOOM_HINT_FIT_LABEL_KEY } from 'components/Design/Toolbar/DesignHint/constants';

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
import { handleZoomToFit } from '../handleZoomToFit';

vi.mock('../../../../utils/animateViewport', () => ({ animateViewport: vi.fn() }));

const addFrameNode = (x: number, width: number): string => {
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
      width,
      x,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleZoomToFit', () => {
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

  it('should fit all top-level nodes when nothing is selected', () => {
    // mock
    addFrameNode(0, 100);
    addFrameNode(300, 100);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), 0, 0);
    const expected = getFitViewport({ height: 100, width: 400, x: 0, y: 0 }, visibleRect, ZOOM_FIT_PADDING_PX);

    // action
    handleZoomToFit(store.dispatch, refs);

    // result
    expect(animateViewport).toHaveBeenCalledWith(store.dispatch, { x: 0, y: 0, zoom: 1 }, expected, getRectCenter(visibleRect));
    expect(selectDesignHintLabelKey(store.getState())).toBe(ZOOM_HINT_FIT_LABEL_KEY);
  });

  it('should fit every top-level node, ignoring the current selection', () => {
    // mock
    addFrameNode(0, 100);
    const selectedId = addFrameNode(300, 100);
    store.dispatch(setSelection([selectedId]));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), 0, 0);
    const expected = getFitViewport({ height: 100, width: 400, x: 0, y: 0 }, visibleRect, ZOOM_FIT_PADDING_PX);

    // action
    handleZoomToFit(store.dispatch, refs);

    // result
    expect(animateViewport).toHaveBeenCalledWith(store.dispatch, { x: 0, y: 0, zoom: 1 }, expected, getRectCenter(visibleRect));
  });

  it('should account for the left and right panel widths when fitting', () => {
    // mock
    addFrameNode(0, 100);
    const refs = createCanvasRefs({
      canvasRef: { current: canvas },
      layout: { leftPanelWidthRef: { current: 200 }, rightPanelWidthRef: { current: 100 } },
    });
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), 200, 100);
    const expected = getFitViewport({ height: 100, width: 100, x: 0, y: 0 }, visibleRect, ZOOM_FIT_PADDING_PX);

    // action
    handleZoomToFit(store.dispatch, refs);

    // result
    expect(animateViewport).toHaveBeenCalledWith(store.dispatch, { x: 0, y: 0, zoom: 1 }, expected, getRectCenter(visibleRect));
  });

  it('should do nothing when there are no nodes at all', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomToFit(store.dispatch, refs);

    // result
    expect(animateViewport).not.toHaveBeenCalled();
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    addFrameNode(0, 100);
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomToFit(store.dispatch, refs);

    // result
    expect(animateViewport).not.toHaveBeenCalled();
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
