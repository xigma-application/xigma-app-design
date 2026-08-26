// types
import { TPlanarVectorNetwork } from '../../planarizeVectorNetwork/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { computeLoopPoints } from '../computeLoopPoints';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });
const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildPlanar = (vertices: TVectorVertex[], segments: TVectorSegment[]): TPlanarVectorNetwork => ({
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

describe('computeLoopPoints', () => {
  it('should chain a closed triangle loop into its ordered flattened points', () => {
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'a')],
    );
    const loopKey = ['s1[v:a|v:b]', 's2[v:b|v:c]', 's3[v:a|v:c]'].sort().join(',');

    const points = computeLoopPoints(loopKey, planar, planar.vertices);

    expect(points).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 50, y: 100 },
    ]);
  });

  it('should return null when one of the loop’s own segment ids no longer exists', () => {
    const planar = buildPlanar([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('s1', 'a', 'b')]);
    const loopKey = ['s1[v:a|v:b]', 's2[v:x|v:y]'].sort().join(',');

    expect(computeLoopPoints(loopKey, planar, planar.vertices)).toBeNull();
  });

  it('should return null when the chained pieces form an open path instead of a closed loop', () => {
    const planar = buildPlanar([vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)], [seg('s1', 'a', 'b'), seg('s2', 'b', 'c')]);
    const loopKey = ['s1[v:a|v:b]', 's2[v:b|v:c]'].sort().join(',');

    expect(computeLoopPoints(loopKey, planar, planar.vertices)).toBeNull();
  });
});
