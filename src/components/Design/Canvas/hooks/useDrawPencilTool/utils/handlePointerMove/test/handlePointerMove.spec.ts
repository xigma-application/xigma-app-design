import { RefObject } from 'react';

// store
import { store } from 'store';

// types
import { TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1, ...options });

const createPointsRef = (value: TPoint[] | null): RefObject<TPoint[] | null> => ({ current: value });
const createAxisLockRef = (value: TAxisLock | null = null): RefObject<TAxisLock | null> => ({ current: value });
const createShiftAnchorRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

describe('handlePointerMove', () => {
  it('should do nothing when there is no stroke in progress', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 10),
      store,
      refs,
      createPointsRef(null),
      createPointsRef(null),
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(null),
    );

    // result
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
  });

  it('should do nothing when the raw-points tracker alone is missing', () => {
    // mock — committed/tail are set, but rawPointsRef is null (e.g. a stale call after cleanup)
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 10),
      store,
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      createPointsRef([{ x: 0, y: 0 }]),
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef(null),
    );

    // result
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
  });

  it('should delegate to advancePencilTail for an ordinary (non-Shift) move', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const tailPointsRef = createPointsRef([{ x: 0, y: 0 }]);

    // before
    handlePointerMove(
      canvas,
      pointerEvent(5, 0),
      store,
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      tailPointsRef,
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef([{ x: 0, y: 0 }]),
    );

    // result — the real tail grows, proving advancePencilTail ran (updateShiftLockedPreview never touches it)
    expect(tailPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('should delegate to updateShiftLockedPreview for a Shift-held move, leaving the real tail untouched', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const tailPointsRef = createPointsRef([{ x: 0, y: 0 }]);

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 3, { shiftKey: true }),
      store,
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      tailPointsRef,
      createAxisLockRef(),
      createShiftAnchorRef(),
      createPointsRef([{ x: 0, y: 0 }]),
    );

    // result — axis-lock preview only, real tail unchanged (that's advancePencilTail's job)
    expect(tailPointsRef.current).toEqual([{ x: 0, y: 0 }]);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should update the raw preview on every move regardless of Shift state', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const rawPointsRef = createPointsRef([{ x: 0, y: 0 }]);

    // before
    handlePointerMove(
      canvas,
      pointerEvent(5, 0, { ctrlKey: true }),
      store,
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      createPointsRef([{ x: 0, y: 0 }]),
      createAxisLockRef(),
      createShiftAnchorRef(),
      rawPointsRef,
    );

    // result
    expect(refs.pencil.pencilShowRawPreviewRef.current).toBe(true);
    expect(rawPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });
});
