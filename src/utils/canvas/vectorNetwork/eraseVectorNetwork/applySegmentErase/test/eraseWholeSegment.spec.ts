// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { eraseWholeSegment } from '../eraseWholeSegment';

const straightNode = (): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
});

describe('eraseWholeSegment', () => {
  it('should drop the segment and leave the vertices for the caller to prune', () => {
    // action
    const result = eraseWholeSegment(straightNode(), 's1');

    // result
    expect(result.segments).toEqual({});
    expect(Object.keys(result.vertices)).toEqual(['a', 'b']);
  });
});
