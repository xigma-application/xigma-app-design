// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../../hooks/useCanvasRefs/createCanvasRefs';
import { handleZoomTo100 } from '../handleZoomTo100';

describe('handleZoomTo100', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
  });

  it('should reset the zoom to 100% around the visible canvas center', () => {
    // mock
    store.dispatch(setViewport({ x: 100, y: 100, zoom: 4 }));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // action
    handleZoomTo100(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState()).zoom).toBe(1);
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 4 }));
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // action
    handleZoomTo100(store.dispatch, refs);

    // result
    expect(selectViewport(store.getState()).zoom).toBe(4);
  });
});
