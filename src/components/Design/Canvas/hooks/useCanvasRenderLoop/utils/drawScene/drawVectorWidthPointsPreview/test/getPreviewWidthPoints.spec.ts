// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getPreviewWidthPoints } from '../getPreviewWidthPoints';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getPreviewWidthPoints', () => {
  it('should return the node’s own committed points when there is no active drag', () => {
    // mock
    const node = buildNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } } });

    // result
    expect(getPreviewWidthPoints(node, null)).toEqual({ p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } });
  });

  it('should overlay the live drag point on top of the committed points for the matching node', () => {
    // mock
    const node = buildNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } } });
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 9, position: 0.5, rightOffset: 9 },
      target: 'left' as const,
    };

    // result
    expect(getPreviewWidthPoints(node, drag)).toEqual({ p1: drag.point });
  });

  it('should show an in-progress new point even though the node has no committed profile yet', () => {
    // mock
    const node = buildNode({ widthProfile: null });
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 5, position: 0.3, rightOffset: 5 },
      target: 'right' as const,
    };

    // result
    expect(getPreviewWidthPoints(node, drag)).toEqual({ p1: drag.point });
  });

  it('should ignore a drag that belongs to a different node', () => {
    // mock
    const node = buildNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } } });
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: 'other-node',
      point: { id: 'p2', leftOffset: 5, position: 0.3, rightOffset: 5 },
      target: 'right' as const,
    };

    // result
    expect(getPreviewWidthPoints(node, drag)).toEqual({ p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } });
  });

  it('should overlay a group target belonging to this node, on top of both its committed points and any primary drag point', () => {
    // mock — a multi-selected group resize dragging p1 (primary, different node) while p2 (this node) syncs along
    const node = buildNode({
      widthProfile: {
        points: {
          p2: { id: 'p2', leftOffset: 2, position: 0.4, rightOffset: 2 },
          p3: { id: 'p3', leftOffset: 3, position: 0.9, rightOffset: 3 },
        },
      },
    });
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [{ nodeId: node.id, point: { id: 'p2', leftOffset: 11, position: 0.4, rightOffset: 11 } }],
      isNewPoint: false,
      nodeId: 'other-node',
      point: { id: 'p1', leftOffset: 11, position: 0.1, rightOffset: 11 },
      target: 'right' as const,
    };

    // result — p2 shows the synced group-target value, p3 stays untouched, p1 (a different node) never appears
    expect(getPreviewWidthPoints(node, drag)).toEqual({
      p2: drag.groupTargets[0].point,
      p3: { id: 'p3', leftOffset: 3, position: 0.9, rightOffset: 3 },
    });
  });
});
