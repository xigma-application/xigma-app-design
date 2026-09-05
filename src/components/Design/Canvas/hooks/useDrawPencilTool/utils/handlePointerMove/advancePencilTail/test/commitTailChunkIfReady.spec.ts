// types
import { TPencilDragRefs } from '../../../../types';

// utils
import { commitTailChunkIfReady } from '../commitTailChunkIfReady';

const pencilDragRefs = (overrides: Partial<TPencilDragRefs> = {}): TPencilDragRefs => ({
  axisLockRef: { current: null },
  committedPointsRef: { current: null },
  rawPointsRef: { current: null },
  shiftAnchorRef: { current: null },
  tailPointsRef: { current: null },
  ...overrides,
});

describe('commitTailChunkIfReady', () => {
  it('should leave the committed prefix and tail untouched while the tail is too short to have a path length', () => {
    // mock — only 2 points, below the "more than 2" gate regardless of length
    const refs = pencilDragRefs();
    const committed = [{ x: 0, y: 0 }];
    const tail = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    // before
    const result = commitTailChunkIfReady(refs, committed, tail, 1, 4);

    // result
    expect(result).toEqual({ committed, tail });
    expect(refs.committedPointsRef.current).toBeNull();
    expect(refs.tailPointsRef.current).toBeNull();
  });

  it('should leave the committed prefix and tail untouched while the path length stays under the chunk threshold', () => {
    // mock — three points spanning only 20px total, under the 30px chunk threshold
    const refs = pencilDragRefs();
    const committed = [{ x: 0, y: 0 }];
    const tail = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];

    // before
    const result = commitTailChunkIfReady(refs, committed, tail, 1, 4);

    // result
    expect(result).toEqual({ committed, tail });
    expect(refs.committedPointsRef.current).toBeNull();
    expect(refs.tailPointsRef.current).toBeNull();
  });

  it('should commit the tail into the committed prefix and reset the tail to its own boundary point once the chunk threshold is crossed', () => {
    // mock — three collinear points spanning 30px (the chunk threshold); collinear so the committed
    // chunk simplifies down to just its two endpoints
    const refs = pencilDragRefs();
    const committed = [{ x: 0, y: 0 }];
    const tail = [
      { x: 0, y: 0 },
      { x: 15, y: 0 },
      { x: 30, y: 0 },
    ];

    // before
    const result = commitTailChunkIfReady(refs, committed, tail, 1, 4);

    // result
    expect(result.committed).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
    expect(result.tail).toEqual([{ x: 30, y: 0 }]);
    expect(refs.committedPointsRef.current).toEqual(result.committed);
    expect(refs.tailPointsRef.current).toEqual(result.tail);
  });
});
