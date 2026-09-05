// store
import { setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should track the pointer’s client position even for a non-primary button', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const lastPointerClientPositionRef = { current: null };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
    );

    // result
    expect(lastPointerClientPositionRef.current).toEqual({ x: 10, y: 10 });
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the selection, snapshot the pointer-down point, and capture the pointer on a primary press', () => {
    // mock
    store.dispatch(setSelection(['stale-id']));

    const canvas = createCanvas();
    const startRef = { current: null };
    const lastPointerClientPositionRef = { current: null };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 60),
      store.dispatch,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
    );

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([]);
    expect(startRef.current).toEqual({ x: 50, y: 60 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });
});
