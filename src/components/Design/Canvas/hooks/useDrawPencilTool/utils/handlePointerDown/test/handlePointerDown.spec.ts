// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';
import { selectSelectedIds } from 'store/design/selectors';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';

// types
import { TPencilDragRefs } from '../../../types';

export const createPencilDragRefs = (overrides: Partial<TPencilDragRefs> = {}): TPencilDragRefs => ({
  axisLockRef: { current: null },
  committedPointsRef: { current: null },
  rawPointsRef: { current: null },
  shiftAnchorRef: { current: null },
  tailPointsRef: { current: null },
  ...overrides,
});

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
    store.dispatch(setSelection(['stale-selection']));
  });

  it('should ignore a non-primary button press entirely', () => {
    // mock
    const canvas = createCanvas();
    const pencilDragRefs = createPencilDragRefs();

    // before
    handlePointerDown(canvas, pointerEvent(10, 20, { button: 1 }), store.dispatch, store, createCanvasRefs(), pencilDragRefs);

    // result
    expect(pencilDragRefs.committedPointsRef.current).toBeNull();
    expect(pencilDragRefs.tailPointsRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should seed both the committed prefix and the tail with the anchor point, and clear any prior selection', () => {
    // mock
    const canvas = createCanvas();
    const pencilDragRefs = createPencilDragRefs();

    // before
    handlePointerDown(canvas, pointerEvent(10, 20), store.dispatch, store, createCanvasRefs(), pencilDragRefs);

    // result
    expect(pencilDragRefs.committedPointsRef.current).toEqual([{ x: 10, y: 20 }]);
    expect(pencilDragRefs.tailPointsRef.current).toEqual([{ x: 10, y: 20 }]);
    expect(pencilDragRefs.rawPointsRef.current).toEqual([{ x: 10, y: 20 }]);
    expect(selectSelectedIds(store.getState())).toEqual([]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should reset any stale axis-lock state from a previous stroke', () => {
    // mock
    const canvas = createCanvas();
    const pencilDragRefs = createPencilDragRefs({
      axisLockRef: { current: 'x' },
      shiftAnchorRef: { current: { x: 1, y: 1 } },
    });

    // before
    handlePointerDown(canvas, pointerEvent(10, 20), store.dispatch, store, createCanvasRefs(), pencilDragRefs);

    // result
    expect(pencilDragRefs.axisLockRef.current).toBeNull();
    expect(pencilDragRefs.shiftAnchorRef.current).toBeNull();
  });
});
