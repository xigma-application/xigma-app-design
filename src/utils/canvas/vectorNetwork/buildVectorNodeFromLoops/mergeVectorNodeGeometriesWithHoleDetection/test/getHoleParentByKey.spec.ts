// types
import { TPoint } from 'types/canvas';
import { TNodeFace } from '../types';

// utils
import { getBounds } from '../getBounds';
import { getHoleParentByKey } from '../getHoleParentByKey';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];
const reversed = (points: TPoint[]): TPoint[] => [...points].reverse();
const face = (points: TPoint[], key: string, sign: number): TNodeFace => ({ bounds: getBounds(points), key, points, sign });

describe('getHoleParentByKey', () => {
  it('should record a genuine hole and leave its container untouched — the "o" counter case', () => {
    const outer = face(square(0, 0, 100), 'outer', 1);
    const hole = face(reversed(square(20, 20, 10)), 'hole', -1);

    expect(getHoleParentByKey([outer, hole])).toEqual({ hole: 'outer' });
  });

  it('should isolate two same-direction overlapping faces on both sides — the "D" stem/bowl case', () => {
    const bowl = face(square(0, 0, 100), 'bowl', 1);
    const stem = face(square(10, 10, 10), 'stem', 1);

    expect(getHoleParentByKey([bowl, stem])).toEqual({ bowl: '__isolated__bowl', stem: '__isolated__stem' });
  });

  it('should leave a container’s own hole free to still find it even though the container also overlaps a third, unrelated face — the "Q" tail case', () => {
    const ring = face(square(0, 0, 20), 'ring', 1);
    const counter = face(reversed(square(5, 5, 5)), 'counter', -1);
    // the tail is fully nested in the ring's bbox but shares its winding direction, so it can never be a
    // real hole of the ring — it must still get isolated, while the ring keeps grouping normally so its
    // own counter can cancel against it
    const tail = face(square(2, 2, 3), 'tail', 1);

    expect(getHoleParentByKey([ring, counter, tail])).toEqual({ counter: 'ring', tail: '__isolated__tail' });
  });

  it('should leave non-overlapping faces from the same self-crossing contour completely untouched — the "x" case', () => {
    const left = face(square(0, 0, 10), 'left', 1);
    const right = face(square(100, 0, 10), 'right', 1);
    const top = face(square(50, 100, 10), 'top', 1);

    expect(getHoleParentByKey([left, right, top])).toEqual({});
  });

  it('should return an empty record for no faces at all', () => {
    expect(getHoleParentByKey([])).toEqual({});
  });
});
