// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../../hooks/useCanvasRefs/createCanvasRefs';
import { handleZoomOut } from '../handleZoomOut';

describe('handleZoomOut', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should step the zoom out around the visible canvas center', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomOut(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState()).zoom).toBe(0.75);
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomOut(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});
