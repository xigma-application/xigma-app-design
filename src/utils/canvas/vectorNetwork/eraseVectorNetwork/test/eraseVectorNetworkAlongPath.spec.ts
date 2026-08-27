// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { eraseVectorNetworkAlongPath } from '../eraseVectorNetworkAlongPath';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

const straightNode = (): TVectorNode =>
  buildNode(
    { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
    { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 200, y: 0 } },
  );

describe('eraseVectorNetworkAlongPath', () => {
  it('should return null when the whole stroke touches nothing', () => {
    // result
    expect(
      eraseVectorNetworkAlongPath(
        straightNode(),
        [
          { x: 0, y: 90 },
          { x: 200, y: 90 },
        ],
        5,
      ),
    ).toBeNull();
  });

  it('should treat a single-point path as one dab', () => {
    // action
    const result = eraseVectorNetworkAlongPath(straightNode(), [{ x: 100, y: 0 }], 15)!;

    // result — a gap in the middle → two stubs
    expect(Object.keys(result.segments)).toHaveLength(2);
  });

  it('should carve one span per segment — a stroke that dips onto the segment at two places cuts one gap, not two', () => {
    // action — the stroke touches the segment near x=50 and again near x=150 (going away in between)
    const result = eraseVectorNetworkAlongPath(
      straightNode(),
      [
        { x: 50, y: 0 },
        { x: 50, y: 40 },
        { x: 150, y: 40 },
        { x: 150, y: 0 },
      ],
      12,
    )!;
    const xs = Object.values(result.segments)
      .flatMap((segment) => [result.vertices[segment.startId].x, result.vertices[segment.endId].x])
      .sort((a, b) => a - b);

    // result — two stubs [0..~50] and [~150..200], the whole [50, 150] span gone as one gap
    expect(Object.keys(result.segments)).toHaveLength(2);
    expect(xs[0]).toBe(0);
    expect(xs[3]).toBe(200);
    expect(xs[1]).toBeLessThan(60);
    expect(xs[2]).toBeGreaterThan(140);
  });

  it('should erase the whole segment when the stroke runs its full length', () => {
    // action
    const result = eraseVectorNetworkAlongPath(
      straightNode(),
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ],
      25,
    )!;

    // result
    expect(result.segments).toEqual({});
  });
});
