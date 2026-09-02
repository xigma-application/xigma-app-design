// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { commitVectorWidthPointDrag } from '../commitVectorWidthPointDrag';

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  ...overrides,
});

describe('commitVectorWidthPointDrag', () => {
  it('should dispatch a fresh widthProfile containing the new point when the node had none', () => {
    // mock
    const node = buildVectorNode({ widthProfile: null });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const dispatch = vi.fn();
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 },
      target: 'right' as const,
    };

    // before
    commitVectorWidthPointDrag(dispatch, nodes, drag);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { widthProfile: { points: { p1: drag.point } } }, id: node.id }));
  });

  it('should merge the new point in alongside any existing points, overwriting one with the same id', () => {
    // mock
    const existingPoint = { id: 'p0', leftOffset: 2, position: 0.2, rightOffset: 2 };
    const node = buildVectorNode({ widthProfile: { points: { p0: existingPoint } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const dispatch = vi.fn();
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: node.id,
      point: { id: 'p0', leftOffset: 9, position: 0.2, rightOffset: 9 },
      target: 'left' as const,
    };

    // before
    commitVectorWidthPointDrag(dispatch, nodes, drag);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { widthProfile: { points: { p0: drag.point } } }, id: node.id }));
  });

  it('should also commit every group target sharing the primary node, merged into the same dispatch', () => {
    // mock — a multi-selected group drag where two regulators on the same node were synced together
    const node = buildVectorNode({
      widthProfile: {
        points: {
          p1: { id: 'p1', leftOffset: 2, position: 0.2, rightOffset: 2 },
          p2: { id: 'p2', leftOffset: 2, position: 0.7, rightOffset: 2 },
        },
      },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const dispatch = vi.fn();
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [{ nodeId: node.id, point: { id: 'p2', leftOffset: 9, position: 0.7, rightOffset: 9 } }],
      isNewPoint: false,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 9, position: 0.2, rightOffset: 9 },
      target: 'left' as const,
    };

    // before
    commitVectorWidthPointDrag(dispatch, nodes, drag);

    // result — one dispatch for the shared node, carrying both updated points
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { widthProfile: { points: { p1: drag.point, p2: drag.groupTargets[0].point } } }, id: node.id }),
    );
  });

  it('should dispatch one updateNode per node when the group spans multiple vector-editing nodes', () => {
    // mock
    const nodeA = buildVectorNode({
      id: 'node-a',
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });
    const nodeB = buildVectorNode({
      id: 'node-b',
      widthProfile: { points: { p2: { id: 'p2', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });
    const nodes: Record<string, TSceneNode> = { 'node-a': nodeA, 'node-b': nodeB };
    const dispatch = vi.fn();
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [{ nodeId: 'node-b', point: { id: 'p2', leftOffset: 12, position: 0.5, rightOffset: 12 } }],
      isNewPoint: false,
      nodeId: 'node-a',
      point: { id: 'p1', leftOffset: 12, position: 0.5, rightOffset: 12 },
      target: 'right' as const,
    };

    // before
    commitVectorWidthPointDrag(dispatch, nodes, drag);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { widthProfile: { points: { p1: drag.point } } }, id: 'node-a' }));
    expect(dispatch).toHaveBeenCalledWith(
      updateNode({ changes: { widthProfile: { points: { p2: drag.groupTargets[0].point } } }, id: 'node-b' }),
    );
  });

  it('should skip a group target whose node can no longer be resolved, without throwing', () => {
    // mock
    const node = buildVectorNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const dispatch = vi.fn();
    const drag = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [{ nodeId: 'missing-node', point: { id: 'p2', leftOffset: 12, position: 0.5, rightOffset: 12 } }],
      isNewPoint: false,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 12, position: 0.5, rightOffset: 12 },
      target: 'right' as const,
    };

    // before
    commitVectorWidthPointDrag(dispatch, nodes, drag);

    // result — the unresolvable node is silently skipped, no updateNode dispatched for it
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { widthProfile: { points: { p1: drag.point } } }, id: node.id }));
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ id: 'missing-node' }) }));
  });
});
