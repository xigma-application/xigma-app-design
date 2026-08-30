// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { buildReplacementNodes } from '../buildReplacementNodes';

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildGroup = (overrides: Partial<TGroupNode>): TGroupNode => ({
  childIds: [],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('buildReplacementNodes', () => {
  it("should land the new root exactly at the target's position and id, taking everything else from the clipboard copy", () => {
    // mock — clipboard copy is a 20x30 frame at (0, 0); target is a plain frame sitting at (100, 200)
    const clipboardRoot = buildFrame({ height: 30, id: 'clip-1', width: 20, x: 0, y: 0 });
    const target = buildFrame({ id: 'target-1', parentId: 'parent-1', x: 100, y: 200 });

    // action
    const result = buildReplacementNodes({ 'clip-1': clipboardRoot }, clipboardRoot, target);

    // result — id and position come from the target, everything else from the clipboard copy
    expect(result.newRoot).toMatchObject({ height: 30, id: 'target-1', parentId: 'parent-1', width: 20, x: 100, y: 200 });
    expect(result.descendants).toEqual([]);
  });

  it("should shift a copied group's whole subtree by the same delta, so the group and its children move together", () => {
    // mock — a group at (0, 0) with one child at (5, 5); target sits at (50, 50)
    const child = buildFrame({ id: 'child-1', parentId: 'group-clip', x: 5, y: 5 });
    const clipboardRoot = buildGroup({ childIds: ['child-1'], id: 'group-clip', x: 0, y: 0 });
    const clipboardNodesById = { 'child-1': child, 'group-clip': clipboardRoot };
    const target = buildFrame({ id: 'target-1', parentId: null, x: 50, y: 50 });

    // action
    const result = buildReplacementNodes(clipboardNodesById, clipboardRoot, target);

    // result — the group root lands on the target's id/position, its child shifts by the same (50, 50) delta
    expect(result.newRoot).toMatchObject({ id: 'target-1', type: NodeType.group, x: 50, y: 50 });
    expect(result.descendants).toHaveLength(1);
    expect(result.descendants[0]).toMatchObject({ parentId: 'target-1', x: 55, y: 55 });
  });
});
