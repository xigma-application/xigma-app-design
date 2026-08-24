import { RefObject } from 'react';

// types
import { TPencilAxis } from '../getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { updateShiftLockedPreview } from '../updateShiftLockedPreview';

const createAxisLockRef = (value: TPencilAxis | null = null): RefObject<TPencilAxis | null> => ({ current: value });
const createShiftAnchorRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

describe('updateShiftLockedPreview', () => {
  it('should preview the raw current point (unlocked) while the move stays under the axis-lock threshold', () => {
    // mock — 1px move in each direction stays under the 4px lock threshold, so no axis locks yet
    const refs = createCanvasRefs();
    const axisLockRef = createAxisLockRef();
    const shiftAnchorRef = createShiftAnchorRef();

    // before
    updateShiftLockedPreview(refs, [{ x: 0, y: 0 }], [{ x: 0, y: 0 }], axisLockRef, shiftAnchorRef, { x: 1, y: 1 }, 1, 4);

    // result
    expect(axisLockRef.current).toBeNull();
    expect(refs.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  it('should lock the dominant axis on the first move without touching the committed tail', () => {
    // mock — mostly-horizontal movement (dx=10, dy=3) locks the 'x' axis
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];
    const axisLockRef = createAxisLockRef();
    const shiftAnchorRef = createShiftAnchorRef();

    // before
    updateShiftLockedPreview(refs, [{ x: 0, y: 0 }], tail, axisLockRef, shiftAnchorRef, { x: 10, y: 3 }, 1, 4);

    // result
    expect(axisLockRef.current).toBe('x');
    expect(shiftAnchorRef.current).toEqual({ x: 0, y: 0 });
    expect(tail).toEqual([{ x: 0, y: 0 }]);
    expect(refs.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should hold the locked axis even once the mouse moves more in the other direction', () => {
    // mock — axis already locked to 'x' from a prior move; a now-more-vertical move must still
    // constrain to the horizontal line through the anchor
    const refs = createCanvasRefs();
    const axisLockRef = createAxisLockRef('x');
    const shiftAnchorRef = createShiftAnchorRef({ x: 0, y: 0 });

    // before
    updateShiftLockedPreview(refs, [{ x: 0, y: 0 }], [{ x: 0, y: 0 }], axisLockRef, shiftAnchorRef, { x: 12, y: 20 }, 1, 4);

    // result
    expect(axisLockRef.current).toBe('x');
    expect(refs.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 12, y: 0 },
    ]);
  });
});
