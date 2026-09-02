// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getVectorMarqueeHandleHitsForNode } from '../getVectorMarqueeHandleHitsForNode';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

const buildNode = (): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
});

describe('getVectorMarqueeHandleHitsForNode', () => {
  it('should catch a handle made visible by the visually-selected vertex', () => {
    const node = buildNode();
    const canvasRefs = createCanvasRefs();

    const result = getVectorMarqueeHandleHitsForNode(node, { height: 2, width: 2, x: 4, y: -1 }, ['v1'], canvasRefs);

    expect(result).toEqual([{ end: 'start', segmentId: 's1' }]);
  });

  it('should not catch a handle that is not visible, even though its position falls inside the rect', () => {
    const node = buildNode();
    const canvasRefs = createCanvasRefs();

    const result = getVectorMarqueeHandleHitsForNode(node, { height: 2, width: 2, x: 4, y: -1 }, [], canvasRefs);

    expect(result).toEqual([]);
  });
});
