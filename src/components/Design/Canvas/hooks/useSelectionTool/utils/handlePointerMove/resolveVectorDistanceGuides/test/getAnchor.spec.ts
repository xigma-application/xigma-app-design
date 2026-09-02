// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getAnchor } from '../getAnchor';

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } },
};

describe('getAnchor', () => {
  it('should anchor on the single selected vertex, as a point', () => {
    expect(getAnchor([node], ['v2'], [])).toEqual({ excludeVertexIds: ['v2'], kind: 'point', point: { id: 'v2', x: 100, y: 40 } });
  });

  it('should return null when the single selected vertex is in none of the nodes', () => {
    expect(getAnchor([node], ['ghost'], [])).toBeNull();
  });

  it('should anchor on the bounding box of two or more selected vertices', () => {
    expect(getAnchor([node], ['v1', 'v2'], [])).toEqual({
      excludeVertexIds: ['v1', 'v2'],
      kind: 'box',
      rect: { height: 40, width: 100, x: 0, y: 0 },
    });
  });

  it('should return null when none of the several selected vertices resolve', () => {
    expect(getAnchor([node], ['ghost1', 'ghost2'], [])).toBeNull();
  });

  it('should anchor on a single selected segment’s midpoint, as a point', () => {
    expect(getAnchor([node], [], ['s1'])).toEqual({ excludeVertexIds: [], kind: 'point', point: { x: 50, y: 20 } });
  });

  it('should return null when the single selected segment is in none of the nodes', () => {
    expect(getAnchor([node], [], ['ghost'])).toBeNull();
  });

  it('should return null when nothing is selected', () => {
    expect(getAnchor([node], [], [])).toBeNull();
  });
});
