// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { isPointInSelectedVectorBounds } from '../isPointInSelectedVectorBounds';

const buildVectorNode = (id = 'a', rotation = 0, width = 100, height = 100): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id,
  name: 'Vector',
  parentId: null,
  rotation,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
    s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
    s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    v1: { id: 'v1', x: 0, y: 0 },
    v2: { id: 'v2', x: width, y: 0 },
    v3: { id: 'v3', x: width, y: height },
    v4: { id: 'v4', x: 0, y: height },
  },
});

const buildFrameNode = (): TSceneNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'b',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

describe('isPointInSelectedVectorBounds', () => {
  it('should return true for a point inside the bounding box of a single selected, unfilled vector node', () => {
    // result — the whole box counts once the vector is already selected, contour-only is only for initial pick
    expect(isPointInSelectedVectorBounds({ x: 50, y: 50 }, [buildVectorNode()])).toBe(true);
  });

  it('should return false when nothing is selected', () => {
    expect(isPointInSelectedVectorBounds({ x: 5, y: 5 }, [])).toBe(false);
  });

  it('should return false when more than one node is selected', () => {
    expect(isPointInSelectedVectorBounds({ x: 50, y: 50 }, [buildVectorNode('a'), buildVectorNode('c')])).toBe(false);
  });

  it('should return false when the single selected node is not a vector', () => {
    expect(isPointInSelectedVectorBounds({ x: 5, y: 5 }, [buildFrameNode()])).toBe(false);
  });

  it('should return false when the point falls outside the bounding box entirely', () => {
    expect(isPointInSelectedVectorBounds({ x: 900, y: 900 }, [buildVectorNode()])).toBe(false);
  });

  it('should test against the box in its actual rotated orientation, not the raw unrotated one', () => {
    // mock — a 100x50 box rotated 90deg around its own center (50, 25)
    const node = buildVectorNode('a', 90, 100, 50);

    // result — (35, 55) sits outside the raw box's y-range but inside the physically rotated one
    expect(isPointInSelectedVectorBounds({ x: 35, y: 55 }, [node])).toBe(true);
    // (80, 10) sits inside the raw box's range but outside the physically rotated one
    expect(isPointInSelectedVectorBounds({ x: 80, y: 10 }, [node])).toBe(false);
  });
});
