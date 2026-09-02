// utils
import { getStraightAdjacency } from '../getStraightAdjacency';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
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

describe('getStraightAdjacency', () => {
  it('should index both directions of a straight segment', () => {
    const node = buildNode(
      { s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: null } },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 } },
    );

    const adjacency = getStraightAdjacency(node);

    expect(adjacency.get('A')).toEqual(['B']);
    expect(adjacency.get('B')).toEqual(['A']);
  });

  it('should skip a segment that has a tangent', () => {
    const node = buildNode(
      { s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 } },
    );

    const adjacency = getStraightAdjacency(node);

    expect(adjacency.get('A')).toBeUndefined();
    expect(adjacency.get('B')).toBeUndefined();
  });

  it('should return the same cached map instance on a second call with the same node reference', () => {
    const node = buildNode(
      { s1: { endId: 'B', id: 's1', startId: 'A', tangentEnd: null, tangentStart: null } },
      { A: { id: 'A', x: 0, y: 0 }, B: { id: 'B', x: 10, y: 0 } },
    );

    const first = getStraightAdjacency(node);
    const second = getStraightAdjacency(node);

    expect(second).toBe(first);
  });
});
