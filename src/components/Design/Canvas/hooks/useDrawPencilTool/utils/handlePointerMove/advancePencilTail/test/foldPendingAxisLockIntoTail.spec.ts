// types
import { TPencilDragRefs } from '../../../../types';

// utils
import { foldPendingAxisLockIntoTail } from '../foldPendingAxisLockIntoTail';

const pencilDragRefs = (overrides: Partial<TPencilDragRefs> = {}): TPencilDragRefs => ({
  axisLockRef: { current: null },
  committedPointsRef: { current: null },
  rawPointsRef: { current: null },
  shiftAnchorRef: { current: null },
  tailPointsRef: { current: null },
  ...overrides,
});

describe('foldPendingAxisLockIntoTail', () => {
  it('should do nothing to the tail when there is no pending axis lock', () => {
    // mock
    const tail = [{ x: 0, y: 0 }];
    const refs = pencilDragRefs();

    // before
    foldPendingAxisLockIntoTail(tail, refs, { x: 15, y: 5 });

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
  });

  it('should push the axis-locked point onto the tail and clear the lock when one is pending', () => {
    // mock — locked to 'x' means y stays at the anchor (0)
    const tail = [{ x: 0, y: 0 }];
    const refs = pencilDragRefs({ axisLockRef: { current: 'x' }, shiftAnchorRef: { current: { x: 0, y: 0 } } });

    // before
    foldPendingAxisLockIntoTail(tail, refs, { x: 15, y: 5 });

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 15, y: 0 },
    ]);
    expect(refs.axisLockRef.current).toBeNull();
    expect(refs.shiftAnchorRef.current).toBeNull();
  });

  it('should clear the lock refs even when only one of the pair is set', () => {
    // mock — axisLockRef alone, with no anchor, never folds a point in but should still reset
    const tail = [{ x: 0, y: 0 }];
    const refs = pencilDragRefs({ axisLockRef: { current: 'x' } });

    // before
    foldPendingAxisLockIntoTail(tail, refs, { x: 15, y: 5 });

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
    expect(refs.axisLockRef.current).toBeNull();
  });
});
