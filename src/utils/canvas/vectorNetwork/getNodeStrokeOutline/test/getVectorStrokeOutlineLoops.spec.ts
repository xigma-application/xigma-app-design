// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorStrokeOutlineLoops } from '../getVectorStrokeOutlineLoops';

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  ...overrides,
});

describe('getVectorStrokeOutlineLoops', () => {
  it('should offset a simple open chain into a stroke band', () => {
    // action
    const loops = getVectorStrokeOutlineLoops(buildVector(), 2);

    // result
    expect(loops?.outer.length).toBeGreaterThan(0);
  });

  it('should return null for a vector network that is not a single simple chain (a branch point)', () => {
    // mock — three segments meeting at vertex "a"
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

    // action
    const loops = getVectorStrokeOutlineLoops(node, 2);

    // result
    expect(loops).toBeNull();
  });
});
