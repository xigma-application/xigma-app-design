// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { eraseSegmentStart } from '../eraseSegmentStart';

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

describe('eraseSegmentStart', () => {
  it('should keep only the far side, running from the split point to the original end', () => {
    // action — erase [0, 0.3]
    const result = eraseSegmentStart(straightNode(), 's1', 0.3);
    const [remaining] = Object.values(result.segments);

    // result
    expect(Object.keys(result.segments)).toHaveLength(1);
    expect(remaining.endId).toBe('b');
    expect(result.vertices[remaining.startId]).toMatchObject({ x: 30, y: 0 });
  });
});
