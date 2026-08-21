// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenVectorSegments } from '../flattenVectorSegments';

const toXY = (points: TPoint[]): TPoint[] => points.map(({ x, y }) => ({ x, y }));

describe('flattenVectorSegments', () => {
  it('should flatten every segment on the node and preserve each one’s segmentId', () => {
    // mock
    const node: TVectorNode = {
      fillColor: '#000',
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: { x: 0, y: 5 }, tangentStart: null },
      },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 10, y: 0 },
        v3: { id: 'v3', x: 10, y: 10 },
      },
    };

    // before
    const flattened = flattenVectorSegments(node);

    // result
    expect(flattened).toHaveLength(2);
    expect(flattened[0].segmentId).toBe('s1');
    expect(flattened[0].startId).toBe('v1');
    expect(flattened[0].endId).toBe('v2');
    expect(toXY(flattened[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(flattened[1].segmentId).toBe('s2');
    expect(flattened[1].startId).toBe('v2');
    expect(flattened[1].endId).toBe('v3');
    expect(flattened[1].points.length).toBeGreaterThan(2);
    expect(toXY(flattened[1].points)[0]).toEqual({ x: 10, y: 0 });
    expect(toXY(flattened[1].points)[flattened[1].points.length - 1]).toEqual({ x: 10, y: 10 });
  });

  it('should return the same cached result for the same node reference instead of recomputing', () => {
    // mock
    const node: TVectorNode = {
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
    };

    // before
    const first = flattenVectorSegments(node);
    const second = flattenVectorSegments(node);

    // result
    expect(second).toBe(first);
  });
});
