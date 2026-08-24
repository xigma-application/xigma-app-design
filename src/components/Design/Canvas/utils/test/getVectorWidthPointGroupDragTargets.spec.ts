// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorWidthPointGroupDragTargets } from '../getVectorWidthPointGroupDragTargets';

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

describe('getVectorWidthPointGroupDragTargets', () => {
  it('should select only the grabbed regulator, with no group targets, when it was not already part of the selection', () => {
    // before
    const result = getVectorWidthPointGroupDragTargets([], {}, 'node-1', 'p1');

    // result
    expect(result).toEqual({
      groupTargets: [],
      selection: [
        { nodeId: 'node-1', pointId: 'p1', side: 'left' },
        { nodeId: 'node-1', pointId: 'p1', side: 'right' },
        { nodeId: 'node-1', pointId: 'p1', side: 'point' },
      ],
    });
  });

  it('should discard any stale diamond-side selection for other regulators when collapsing to the grabbed one', () => {
    // mock — p2 previously had its diamonds selected from an earlier single drag, but is not part of this grab
    const currentSelection = [
      { nodeId: 'node-1', pointId: 'p2', side: 'left' as const },
      { nodeId: 'node-1', pointId: 'p2', side: 'right' as const },
      { nodeId: 'node-1', pointId: 'p2', side: 'point' as const },
    ];

    // before
    const result = getVectorWidthPointGroupDragTargets(currentSelection, {}, 'node-1', 'p1');

    // result — p2 is not in the "point"-selected set at all here, so grabbing p1 collapses to just p1
    expect(result.selection).toEqual([
      { nodeId: 'node-1', pointId: 'p1', side: 'left' },
      { nodeId: 'node-1', pointId: 'p1', side: 'right' },
      { nodeId: 'node-1', pointId: 'p1', side: 'point' },
    ]);
    expect(result.groupTargets).toEqual([]);
  });

  it('should expand the whole multi-selection to left/right/point and collect the other regulators as group targets, when the grabbed one is already multi-selected', () => {
    // mock — p1 and p2 were both shift-selected (only "point" entries), grabbing p1's diamond
    const node = buildNode({
      widthProfile: {
        points: {
          p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 },
          p2: { id: 'p2', leftOffset: 9, position: 0.6, rightOffset: 9 },
        },
      },
    });
    const nodes: Record<string, TSceneNode> = { 'node-1': node };
    const currentSelection = [
      { nodeId: 'node-1', pointId: 'p1', side: 'point' as const },
      { nodeId: 'node-1', pointId: 'p2', side: 'point' as const },
    ];

    // before
    const result = getVectorWidthPointGroupDragTargets(currentSelection, nodes, 'node-1', 'p1');

    // result
    expect(result.selection).toEqual([
      { nodeId: 'node-1', pointId: 'p1', side: 'left' },
      { nodeId: 'node-1', pointId: 'p1', side: 'right' },
      { nodeId: 'node-1', pointId: 'p1', side: 'point' },
      { nodeId: 'node-1', pointId: 'p2', side: 'left' },
      { nodeId: 'node-1', pointId: 'p2', side: 'right' },
      { nodeId: 'node-1', pointId: 'p2', side: 'point' },
    ]);
    expect(result.groupTargets).toEqual([{ nodeId: 'node-1', point: node.widthProfile?.points.p2 }]);
  });

  it('should support group targets that live on a different vector-editing node', () => {
    // mock
    const nodeA = buildNode({ id: 'node-a', widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 4 } } } });
    const nodeB = buildNode({ id: 'node-b', widthProfile: { points: { p2: { id: 'p2', leftOffset: 7, position: 0.3, rightOffset: 7 } } } });
    const nodes: Record<string, TSceneNode> = { 'node-a': nodeA, 'node-b': nodeB };
    const currentSelection = [
      { nodeId: 'node-a', pointId: 'p1', side: 'point' as const },
      { nodeId: 'node-b', pointId: 'p2', side: 'point' as const },
    ];

    // before
    const result = getVectorWidthPointGroupDragTargets(currentSelection, nodes, 'node-a', 'p1');

    // result
    expect(result.groupTargets).toEqual([{ nodeId: 'node-b', point: nodeB.widthProfile?.points.p2 }]);
  });

  it('should skip a selected regulator whose node can no longer be resolved', () => {
    // mock — p2 is selected but its node has since been deleted
    const node = buildNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 } } } });
    const nodes: Record<string, TSceneNode> = { 'node-1': node };
    const currentSelection = [
      { nodeId: 'node-1', pointId: 'p1', side: 'point' as const },
      { nodeId: 'missing-node', pointId: 'p2', side: 'point' as const },
    ];

    // before
    const result = getVectorWidthPointGroupDragTargets(currentSelection, nodes, 'node-1', 'p1');

    // result
    expect(result.groupTargets).toEqual([]);
  });

  it('should skip a selected regulator whose node is no longer a vector node', () => {
    // mock — p2's node got converted to a different node type
    const node = buildNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 } } } });
    const otherNode = { ...buildNode({ id: 'node-2' }), type: NodeType.frame } as unknown as TSceneNode;
    const nodes: Record<string, TSceneNode> = { 'node-1': node, 'node-2': otherNode };
    const currentSelection = [
      { nodeId: 'node-1', pointId: 'p1', side: 'point' as const },
      { nodeId: 'node-2', pointId: 'p2', side: 'point' as const },
    ];

    // before
    const result = getVectorWidthPointGroupDragTargets(currentSelection, nodes, 'node-1', 'p1');

    // result
    expect(result.groupTargets).toEqual([]);
  });

  it('should skip a selected regulator whose node has no width profile', () => {
    // mock — p2's node exists but has never had a width point added
    const node = buildNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 } } } });
    const otherNode = buildNode({ id: 'node-2', widthProfile: null });
    const nodes: Record<string, TSceneNode> = { 'node-1': node, 'node-2': otherNode };
    const currentSelection = [
      { nodeId: 'node-1', pointId: 'p1', side: 'point' as const },
      { nodeId: 'node-2', pointId: 'p2', side: 'point' as const },
    ];

    // before
    const result = getVectorWidthPointGroupDragTargets(currentSelection, nodes, 'node-1', 'p1');

    // result
    expect(result.groupTargets).toEqual([]);
  });
});
