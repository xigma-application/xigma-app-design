// store
import { selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1 });

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no drag has started', () => {
    // mock
    const canvas = createCanvas();
    const lastPointRef = { current: null };

    // before
    handlePointerMove(canvas, pointerEvent(50, 50), store.dispatch, lastPointRef);

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should pan the viewport by the pointer delta and update the last point', () => {
    // mock
    const canvas = createCanvas();
    const lastPointRef = { current: { x: 20, y: 20 } };

    // before
    handlePointerMove(canvas, pointerEvent(50, 35), store.dispatch, lastPointRef);

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 30, y: 15, zoom: 1 });
    expect(lastPointRef.current).toEqual({ x: 50, y: 35 });
  });
});
