// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getSelectedVerticesRect } from '../getSelectedVerticesRect';

const nodeA: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-a',
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

const nodeB: TVectorNode = {
  ...nodeA,
  id: 'vector-b',
  segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null } },
  vertices: { v3: { id: 'v3', x: 50, y: 100 }, v4: { id: 'v4', x: 200, y: -10 } },
};

describe('getSelectedVerticesRect', () => {
  it('should return the bounding box of two selected vertices within the same node', () => {
    expect(getSelectedVerticesRect([nodeA], ['v1', 'v2'])).toEqual({ height: 40, width: 100, x: 0, y: 0 });
  });

  it('should span vertices selected across more than one editing node', () => {
    expect(getSelectedVerticesRect([nodeA, nodeB], ['v2', 'v3', 'v4'])).toEqual({ height: 110, width: 150, x: 50, y: -10 });
  });

  it('should ignore ids that resolve to no vertex in any node', () => {
    expect(getSelectedVerticesRect([nodeA], ['v1', 'ghost'])).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should return null when none of the ids resolve', () => {
    expect(getSelectedVerticesRect([nodeA], ['ghost1', 'ghost2'])).toBeNull();
  });
});
