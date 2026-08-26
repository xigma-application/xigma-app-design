// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getPlanarVectorNetwork } from '../getPlanarVectorNetwork';

const buildNode = (): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('getPlanarVectorNetwork', () => {
  it('should planarize the node’s segments and vertices into a planar network', () => {
    // mock
    const node = buildNode();

    // before
    const planar = getPlanarVectorNetwork(node);

    // result
    expect(Object.keys(planar.vertices)).toEqual(expect.arrayContaining(['v1', 'v2']));
    expect(Object.keys(planar.segments)).toEqual(expect.arrayContaining(['s1']));
  });

  it('should return the same cached result for the same node reference instead of recomputing', () => {
    // mock
    const node = buildNode();

    // before
    const first = getPlanarVectorNetwork(node);
    const second = getPlanarVectorNetwork(node);

    // result
    expect(second).toBe(first);
  });

  it('should recompute a fresh result for a different node reference, even with identical content', () => {
    // mock
    const nodeA = buildNode();
    const nodeB = buildNode();

    // before
    const resultA = getPlanarVectorNetwork(nodeA);
    const resultB = getPlanarVectorNetwork(nodeB);

    // result
    expect(resultB).not.toBe(resultA);
    expect(resultB).toEqual(resultA);
  });
});
