// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorHandleAtPointAcrossOpenNodes } from '../getVectorHandleAtPointAcrossOpenNodes';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getVectorHandleAtPointAcrossOpenNodes', () => {
  it('should return null when no node is open for editing', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorHandleAtPointAcrossOpenNodes({ x: 5, y: 0 }, [], nodes, 1, ['v1'], [], []);

    // result
    expect(result).toBeNull();
  });

  it('should hit the tangentStart handle on the single open node', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorHandleAtPointAcrossOpenNodes({ x: 5, y: 0 }, ['a'], nodes, 1, ['v1'], [], []);

    // result
    expect(result).toEqual({ hit: { end: 'start', segmentId: 's1', vertexId: 'v1' }, node });
  });

  it('should pick the closer handle when two open nodes both hit', () => {
    // mock — both nodes carry a real tangentStart handle at the same absolute point, but "b" is closer
    // to the query point
    const nodeA = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodeB = buildVectorNode({
      id: 'b',
      segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: { x: 5.5, y: 0 } } },
      vertices: { v3: { id: 'v3', x: 0, y: 0 }, v4: { id: 'v4', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const result = getVectorHandleAtPointAcrossOpenNodes({ x: 5.5, y: 0 }, ['a', 'b'], nodes, 1, ['v1', 'v3'], [], []);

    // result
    expect(result).toEqual({ hit: { end: 'start', segmentId: 's2', vertexId: 'v3' }, node: nodeB });
  });

  it('should hit the tangentEnd handle when the query point lands on the end side rather than the start side', () => {
    // mock — real tangentEnd only, handleEnd = v2(10,0) + (-5,0) = (5,0)
    const node = buildVectorNode({
      id: 'a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const result = getVectorHandleAtPointAcrossOpenNodes({ x: 5, y: 0 }, ['a'], nodes, 1, ['v2'], [], []);

    // result
    expect(result).toEqual({ hit: { end: 'end', segmentId: 's1', vertexId: 'v2' }, node });
  });
});
