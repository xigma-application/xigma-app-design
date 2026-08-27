import { RefObject } from 'react';

// types
import { TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { foldPendingAxisLock } from '../foldPendingAxisLock';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1 });
const createAxisLockRef = (value: TAxisLock | null = null): RefObject<TAxisLock | null> => ({ current: value });
const createShiftAnchorRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('foldPendingAxisLock', () => {
  it('should do nothing when there is no pending axis lock', () => {
    // mock
    const tail = [{ x: 0, y: 0 }];

    // before
    foldPendingAxisLock(createCanvas(), pointerEvent(50, 30), IDENTITY_VIEWPORT, tail, createAxisLockRef(), createShiftAnchorRef());

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
  });

  it('should push the axis-locked point onto the tail when a lock is pending', () => {
    // mock — pointerup lands at (50, 30); locked to 'x' means y stays at the anchor (0)
    const tail = [{ x: 0, y: 0 }];

    // before
    foldPendingAxisLock(
      createCanvas(),
      pointerEvent(50, 30),
      IDENTITY_VIEWPORT,
      tail,
      createAxisLockRef('x'),
      createShiftAnchorRef({ x: 0, y: 0 }),
    );

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
    ]);
  });
});
