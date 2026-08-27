import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const createPointsRef = (): RefObject<TPoint[] | null> => ({ current: null });
const createAxisLockRef = (): RefObject<TAxisLock | null> => ({ current: null });
const createShiftAnchorRef = (): RefObject<TPoint | null> => ({ current: null });

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection(['stale-selection']));
  });

  it('should ignore a non-primary button press entirely', () => {
    // mock
    const canvas = createCanvas();
    const committedPointsRef = createPointsRef();
    const tailPointsRef = createPointsRef();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 20, { button: 1 }),
      store.dispatch,
      store,
      createCanvasRefs(),
      committedPointsRef,
      tailPointsRef,
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(),
    );

    // result
    expect(committedPointsRef.current).toBeNull();
    expect(tailPointsRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should seed both the committed prefix and the tail with the anchor point, and clear any prior selection', () => {
    // mock
    const canvas = createCanvas();
    const committedPointsRef = createPointsRef();
    const tailPointsRef = createPointsRef();
    const rawPointsRef = createPointsRef();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 20),
      store.dispatch,
      store,
      createCanvasRefs(),
      committedPointsRef,
      tailPointsRef,
      createAxisLockRef(),
      createShiftAnchorRef(),
      rawPointsRef,
    );

    // result
    expect(committedPointsRef.current).toEqual([{ x: 10, y: 20 }]);
    expect(tailPointsRef.current).toEqual([{ x: 10, y: 20 }]);
    expect(rawPointsRef.current).toEqual([{ x: 10, y: 20 }]);
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should reset any stale axis-lock state from a previous stroke', () => {
    // mock
    const canvas = createCanvas();
    const axisLockRef = createAxisLockRef();
    const shiftAnchorRef = createShiftAnchorRef();

    axisLockRef.current = 'x';
    shiftAnchorRef.current = { x: 1, y: 1 };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 20),
      store.dispatch,
      store,
      createCanvasRefs(),
      createPointsRef(),
      createPointsRef(),
      axisLockRef,
      shiftAnchorRef,
      createPointsRef(),
    );

    // result
    expect(axisLockRef.current).toBeNull();
    expect(shiftAnchorRef.current).toBeNull();
  });
});
