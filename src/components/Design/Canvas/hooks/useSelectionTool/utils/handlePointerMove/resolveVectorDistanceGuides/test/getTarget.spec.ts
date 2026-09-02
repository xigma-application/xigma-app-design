// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getTarget } from '../getTarget';

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 } },
};

describe('getTarget', () => {
  it('should target a hovered vertex that is not excluded', () => {
    expect(getTarget([node], ['v1'], 'v3', null)).toEqual({ kind: 'vertex', point: { id: 'v3', x: 100, y: 100 } });
  });

  it('should return null when the only hovered vertex is excluded', () => {
    expect(getTarget([node], ['v1'], 'v1', null)).toBeNull();
  });

  it('should return null when the hovered vertex is excluded as part of a multi-vertex (box) anchor', () => {
    expect(getTarget([node], ['v1', 'v2'], 'v2', null)).toBeNull();
  });

  it('should return null when the hovered vertex is in none of the nodes', () => {
    expect(getTarget([node], ['v1'], 'ghost', null)).toBeNull();
  });

  it('should target a hovered segment whose endpoints are not excluded, as its sampled polyline', () => {
    expect(getTarget([node], ['v1'], null, 's2')).toEqual({
      kind: 'segment',
      polyline: [
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
    });
  });

  it('should return null when the hovered segment meets an excluded vertex', () => {
    expect(getTarget([node], ['v1'], null, 's1')).toBeNull();
  });

  it('should return null when the hovered segment meets a vertex excluded as part of a box anchor', () => {
    expect(getTarget([node], ['v1', 'v3'], null, 's2')).toBeNull();
  });

  it('should return null when the hovered segment is in none of the nodes', () => {
    expect(getTarget([node], ['v1'], null, 'ghost')).toBeNull();
  });

  it('should return null when nothing is hovered', () => {
    expect(getTarget([node], ['v1'], null, null)).toBeNull();
  });
});
