// utils
import { foldPendingAxisLock } from '../foldPendingAxisLock';

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

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1 });

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('foldPendingAxisLock', () => {
  it('should do nothing when there is no pending axis lock', () => {
    // mock
    const tail = [{ x: 0, y: 0 }];

    // before
    foldPendingAxisLock(createCanvas(), pointerEvent(50, 30), IDENTITY_VIEWPORT, tail, createPencilDragRefs());

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
  });

  it('should push the axis-locked point onto the tail when a lock is pending', () => {
    // mock — pointerup lands at (50, 30); locked to 'x' means y stays at the anchor (0)
    const tail = [{ x: 0, y: 0 }];
    const pencilDragRefs = createPencilDragRefs({
      axisLockRef: { current: 'x' },
      shiftAnchorRef: { current: { x: 0, y: 0 } },
    });

    // before
    foldPendingAxisLock(createCanvas(), pointerEvent(50, 30), IDENTITY_VIEWPORT, tail, pencilDragRefs);

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
    ]);
  });
});
