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

  it('should sweep every consecutive pair of a multi-point path, accumulating the erased result', () => {
    // action — two separate dabs along the segment carve two gaps → three stubs
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

    // result
    expect(Object.keys(result.segments)).toHaveLength(3);
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
