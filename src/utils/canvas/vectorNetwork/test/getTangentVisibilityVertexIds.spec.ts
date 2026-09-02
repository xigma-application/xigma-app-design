// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getTangentVisibilityVertexIds } from '../getTangentVisibilityVertexIds';

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

describe('getTangentVisibilityVertexIds', () => {
  it('should return the visual selection as-is when no handle is selected', () => {
    // action
    const result = getTangentVisibilityVertexIds(node, ['v1', 'v2'], []);

    // result
    expect(result).toEqual(['v1', 'v2']);
  });

  it("should add a selected handle's own parent vertex, so it behaves like that vertex being selected", () => {
    // action — s1's tangentStart handle belongs to v1
    const result = getTangentVisibilityVertexIds(node, [], [{ end: 'start', segmentId: 's1' }]);

    // result
    expect(result).toEqual(['v1']);
  });

  it("should add the handle's end-side vertex too", () => {
    // action
    const result = getTangentVisibilityVertexIds(node, [], [{ end: 'end', segmentId: 's1' }]);

    // result
    expect(result).toEqual(['v2']);
  });

  it('should dedupe when the same vertex is reachable through both the visual selection and a selected handle', () => {
    // action
    const result = getTangentVisibilityVertexIds(node, ['v1'], [{ end: 'start', segmentId: 's1' }]);

    // result
    expect(result).toEqual(['v1']);
  });

  it('should ignore a selected handle whose segment does not belong to this node — e.g. a handle selected on a different node while several are open for editing', () => {
    // action
    const result = getTangentVisibilityVertexIds(node, ['v1'], [{ end: 'start', segmentId: 'segment-from-another-node' }]);

    // result
    expect(result).toEqual(['v1']);
  });
});
