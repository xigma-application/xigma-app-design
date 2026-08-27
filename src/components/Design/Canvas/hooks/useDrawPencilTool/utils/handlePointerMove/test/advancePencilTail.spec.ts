import { RefObject } from 'react';

// types
import { TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { advancePencilTail } from '../advancePencilTail';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createPointsRef = (value: TPoint[] | null): RefObject<TPoint[] | null> => ({ current: value });
const createAxisLockRef = (value: TAxisLock | null = null): RefObject<TAxisLock | null> => ({ current: value });
const createShiftAnchorRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

describe('advancePencilTail', () => {
  it('should ignore a move under the minimum drag distance, but still refresh the live preview', () => {
    // mock — 1px move, under the 2px throttle
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];

    // before
    advancePencilTail(
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      createPointsRef(tail),
      createAxisLockRef(),
      createShiftAnchorRef(),
      [{ x: 0, y: 0 }],
      tail,
      { x: 1, y: 0 },
      1,
      4,
    );

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
    expect(refs.pencilPreviewPointsRef.current).toEqual([{ x: 0, y: 0 }]);
  });

  it('should push a new tail point once the move clears the minimum drag distance', () => {
    // mock
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];

    // before
    advancePencilTail(
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      createPointsRef(tail),
      createAxisLockRef(),
      createShiftAnchorRef(),
      [{ x: 0, y: 0 }],
      tail,
      { x: 5, y: 0 },
      1,
      4,
    );

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
    expect(refs.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('should commit the tail into the committed prefix once its path length crosses the chunk threshold, resetting the tail to the boundary point', () => {
    // mock — three 10px moves along a straight line: path length hits 30 (the chunk threshold) on
    // the third move; being collinear, the committed chunk simplifies down to just its endpoints
    const refs = createCanvasRefs();
    const committedPointsRef = createPointsRef([{ x: 0, y: 0 }]);
    const tailPointsRef = createPointsRef([{ x: 0, y: 0 }]);
    const axisLockRef = createAxisLockRef();
    const shiftAnchorRef = createShiftAnchorRef();

    // before
    [10, 20, 30].forEach((x) => {
      advancePencilTail(
        refs,
        committedPointsRef,
        tailPointsRef,
        axisLockRef,
        shiftAnchorRef,
        committedPointsRef.current as TPoint[],
        tailPointsRef.current as TPoint[],
        { x, y: 0 },
        1,
        4,
      );
    });

    // result
    expect(committedPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
    expect(tailPointsRef.current).toEqual([{ x: 30, y: 0 }]);
    expect(refs.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
  });

  it('should fold the locked axis point into the tail and clear the lock once Shift has been released', () => {
    // mock — this runs as the first ordinary move after Shift released, with the lock/anchor still
    // set from the drag; landing exactly on the locked line means the plain throttle push that
    // follows sees 0 distance from the just-folded-in point, so only one point gets appended
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];
    const axisLockRef = createAxisLockRef('x');
    const shiftAnchorRef = createShiftAnchorRef({ x: 0, y: 0 });

    // before
    advancePencilTail(
      refs,
      createPointsRef([{ x: 0, y: 0 }]),
      createPointsRef(tail),
      axisLockRef,
      shiftAnchorRef,
      [{ x: 0, y: 0 }],
      tail,
      { x: 15, y: 0 },
      1,
      4,
    );

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 15, y: 0 },
    ]);
    expect(axisLockRef.current).toBeNull();
    expect(shiftAnchorRef.current).toBeNull();
  });
});
