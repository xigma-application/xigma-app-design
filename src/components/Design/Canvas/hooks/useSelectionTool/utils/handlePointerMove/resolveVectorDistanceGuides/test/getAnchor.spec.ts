// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getAnchor } from '../getAnchor';

const node: TVectorNode = {
  fillColor: null,
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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

describe('getAnchor', () => {
  it('should anchor on the single selected vertex', () => {
    expect(getAnchor([node], ['v2'], [])).toEqual({ anchorVertexId: 'v2', point: { id: 'v2', x: 100, y: 0 } });
  });

  it('should return null when the single selected vertex is in none of the nodes', () => {
    expect(getAnchor([node], ['ghost'], [])).toBeNull();
  });

  it('should anchor on a single selected segment’s midpoint', () => {
    expect(getAnchor([node], [], ['s1'])).toEqual({ anchorVertexId: null, point: { x: 50, y: 0 } });
  });

  it('should return null when the single selected segment is in none of the nodes', () => {
    expect(getAnchor([node], [], ['ghost'])).toBeNull();
  });

  it('should return null when nothing is selected', () => {
    expect(getAnchor([node], [], [])).toBeNull();
  });

  it('should return null when more than one vertex is selected', () => {
    expect(getAnchor([node], ['v1', 'v2'], [])).toBeNull();
  });
});
