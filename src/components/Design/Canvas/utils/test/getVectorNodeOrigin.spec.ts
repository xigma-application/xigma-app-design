// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeOrigin } from '../getVectorNodeOrigin';

describe('getVectorNodeOrigin', () => {
  it('should snapshot vertices as plain {x,y} points and segments as full records, both keyed by id', () => {
    // mock
    const node: TVectorNode = {
      fillColor: '#000',
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 1, y: 2 } } },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    };

    // before
    const origin = getVectorNodeOrigin(node);

    // result
    expect(origin.vertices).toEqual({ v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } });
    expect(origin.segments).toEqual({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 1, y: 2 } } });
    // the segment is a defensive copy (via spread), not the same reference as the node's own record
    expect(origin.segments.s1).not.toBe(node.segments.s1);
  });
});
