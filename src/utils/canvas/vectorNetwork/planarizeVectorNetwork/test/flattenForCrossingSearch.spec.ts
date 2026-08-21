// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenForCrossingSearch } from '../flattenForCrossingSearch';

const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

describe('flattenForCrossingSearch', () => {
  it('should reduce a straight segment to just its two endpoints', () => {
    // mock
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // result
    expect(flattenForCrossingSearch(segment, vertices)).toEqual([vertices.a, vertices.b]);
  });

  it('should flatten a curved segment into many more than two points', () => {
    // mock
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: 0, y: -50 }, tangentStart: { x: 0, y: 50 } };

    // before
    const points = flattenForCrossingSearch(segment, vertices);

    // result
    expect(points.length).toBeGreaterThan(2);
    expect(points[0]).toEqual({ x: vertices.a.x, y: vertices.a.y });
    expect(points[points.length - 1]).toEqual({ x: vertices.b.x, y: vertices.b.y });
  });
});
