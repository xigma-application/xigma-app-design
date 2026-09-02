// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getSimpleVectorChain } from '../getSimpleVectorChain';

const buildVector = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

describe('getSimpleVectorChain', () => {
  it('should return null for a vector with no segments', () => {
    // mock
    const node = buildVector({});

    // result
    expect(getSimpleVectorChain(node)).toBeNull();
  });

  it('should walk an open 2-segment chain in order, regardless of segment direction', () => {
    // mock — a(0,0) -> b(10,0) -> c(10,10), with the second segment authored backwards (c -> b)
    const node = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'b', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        c: { id: 'c', x: 10, y: 10 },
      },
    });

    // action
    const result = getSimpleVectorChain(node);

    // result
    expect(result?.closed).toBe(false);
    expect(result?.points.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  it('should walk a closed triangular loop, dropping the duplicated closing point', () => {
    // mock — a(0,0) -> b(10,0) -> c(0,10) -> back to a
    const node = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        c: { id: 'c', x: 0, y: 10 },
      },
    });

    // action
    const result = getSimpleVectorChain(node);

    // result
    expect(result?.closed).toBe(true);
    expect(result?.points).toHaveLength(3);
  });

  it('should return null for a network with a branch point (3+ incident segments)', () => {
    // mock — a "Y" shape: b, c, and d all meeting at a
    const node = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'a', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'a', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        c: { id: 'c', x: -10, y: 0 },
        d: { id: 'd', x: 0, y: 10 },
      },
    });

    // result
    expect(getSimpleVectorChain(node)).toBeNull();
  });

  it('should return null for two disconnected open chains', () => {
    // mock — a -> b, and a separate c -> d
    const node = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        c: { id: 'c', x: 0, y: 20 },
        d: { id: 'd', x: 10, y: 20 },
      },
    });

    // result
    expect(getSimpleVectorChain(node)).toBeNull();
  });

  it('should return null for two disconnected closed loops', () => {
    // mock — a triangle a-b-c, and a separate triangle d-e-f
    const node = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'e', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
        s5: { endId: 'f', id: 's5', startId: 'e', tangentEnd: null, tangentStart: null },
        s6: { endId: 'd', id: 's6', startId: 'f', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        c: { id: 'c', x: 0, y: 10 },
        d: { id: 'd', x: 100, y: 0 },
        e: { id: 'e', x: 110, y: 0 },
        f: { id: 'f', x: 100, y: 10 },
      },
    });

    // result
    expect(getSimpleVectorChain(node)).toBeNull();
  });

  it('should return null when the two degree-1 endpoints belong to different components', () => {
    // mock — an open chain a -> b, disconnected from a separate closed loop d-e-f
    const node = buildVector({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'e', id: 's2', startId: 'd', tangentEnd: null, tangentStart: null },
        s3: { endId: 'f', id: 's3', startId: 'e', tangentEnd: null, tangentStart: null },
        s4: { endId: 'd', id: 's4', startId: 'f', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        d: { id: 'd', x: 100, y: 0 },
        e: { id: 'e', x: 110, y: 0 },
        f: { id: 'f', x: 100, y: 10 },
      },
    });

    // result
    expect(getSimpleVectorChain(node)).toBeNull();
  });
});
