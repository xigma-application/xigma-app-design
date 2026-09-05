// types
import { TPencilDragRefs } from '../../../../types';
import { TPoint } from 'types/canvas';

// utils
import { advancePencilTail } from '../advancePencilTail';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

export const createPencilDragRefs = (overrides: Partial<TPencilDragRefs> = {}): TPencilDragRefs => ({
  axisLockRef: { current: null },
  committedPointsRef: { current: null },
  rawPointsRef: { current: null },
  shiftAnchorRef: { current: null },
  tailPointsRef: { current: null },
  ...overrides,
});

describe('advancePencilTail', () => {
  it('should ignore a move under the minimum drag distance, but still refresh the live preview', () => {
    // mock — 1px move, under the 2px throttle
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];
    const pencilDragRefs = createPencilDragRefs();

    // before
    advancePencilTail(refs, pencilDragRefs, [{ x: 0, y: 0 }], tail, { x: 1, y: 0 }, 1, 4);

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([{ x: 0, y: 0 }]);
  });

  it('should push a new tail point once the move clears the minimum drag distance', () => {
    // mock
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];
    const pencilDragRefs = createPencilDragRefs();

    // before
    advancePencilTail(refs, pencilDragRefs, [{ x: 0, y: 0 }], tail, { x: 5, y: 0 }, 1, 4);

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('should commit the tail into the committed prefix once its path length crosses the chunk threshold, resetting the tail to the boundary point', () => {
    // mock — three 10px moves along a straight line: path length hits 30 (the chunk threshold) on
    // the third move; being collinear, the committed chunk simplifies down to just its endpoints
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs({
      committedPointsRef: { current: [{ x: 0, y: 0 }] },
      tailPointsRef: { current: [{ x: 0, y: 0 }] },
    });

    // before
    [10, 20, 30].forEach((x) => {
      advancePencilTail(
        refs,
        pencilDragRefs,
        pencilDragRefs.committedPointsRef.current as TPoint[],
        pencilDragRefs.tailPointsRef.current as TPoint[],
        { x, y: 0 },
        1,
        4,
      );
    });

    // result
    expect(pencilDragRefs.committedPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
    expect(pencilDragRefs.tailPointsRef.current).toEqual([{ x: 30, y: 0 }]);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
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
    const pencilDragRefs = createPencilDragRefs({
      axisLockRef: { current: 'x' },
      shiftAnchorRef: { current: { x: 0, y: 0 } },
    });

    // before
    advancePencilTail(refs, pencilDragRefs, [{ x: 0, y: 0 }], tail, { x: 15, y: 0 }, 1, 4);

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 15, y: 0 },
    ]);
    expect(pencilDragRefs.axisLockRef.current).toBeNull();
    expect(pencilDragRefs.shiftAnchorRef.current).toBeNull();
  });
});
