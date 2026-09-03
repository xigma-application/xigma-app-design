// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../../hooks/useCanvasRefs/createCanvasRefs';
import { handleZoomIn } from '../handleZoomIn';

describe('handleZoomIn', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should step the zoom in around the visible canvas center', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomIn(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState()).zoom).toBe(1.5);
  });

  it('should center around the panel-aware visible rect, not the full canvas', () => {
    // mock — a left panel eats the left 200px, so the visible-rect center shifts right
    const refs = createCanvasRefs({
      canvasRef: { current: canvas },
      layout: { leftPanelWidthRef: { current: 200 }, rightPanelWidthRef: { current: 0 } },
    });

    // action
    handleZoomIn(store.dispatch, refs);

    // result — anchor stays fixed on screen at the visible-rect center (200 + 800/2 = 600)
    const viewport = selectViewport(store.getState());
    expect(viewport.zoom).toBe(1.5);
    expect(viewport.x).toBe(600 - 600 * 1.5);
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomIn(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
