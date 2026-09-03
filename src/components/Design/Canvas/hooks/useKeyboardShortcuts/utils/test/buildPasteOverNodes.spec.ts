// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { buildPasteOverNodes } from '../buildPasteOverNodes';

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  childIds: [], clipContent: true, type: NodeType.frame,
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

describe('buildPasteOverNodes', () => {
  it("should land a fresh copy exactly at the target's position and parent, without touching the target's own id", () => {
    // mock — clipboard copy is a 20x30 frame at (0, 0); target is a plain frame sitting at (100, 200)
    const clipboardRoot = buildFrame({ height: 30, id: 'clip-1', width: 20, x: 0, y: 0 });
    const target = buildFrame({ id: 'target-1', parentId: 'parent-1', x: 100, y: 200 });

    // action
    const result = buildPasteOverNodes({ 'clip-1': clipboardRoot }, clipboardRoot, target);

    // result — a fresh id, positioned/nested like the target, but the target itself is not in the result
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]).toMatchObject({ height: 30, parentId: 'parent-1', width: 20, x: 100, y: 200 });
    expect(result.nodes[0].id).not.toBe('clip-1');
    expect(result.nodes[0].id).not.toBe('target-1');
    expect(result.rootIds).toEqual([result.nodes[0].id]);
  });

  it("should shift a copied group's whole subtree by the same delta, keeping the fresh root's children parented to it", () => {
    // mock — a group at (0, 0) with one child at (5, 5); target sits at (50, 50)
    const child = buildFrame({ id: 'child-1', parentId: 'group-clip', x: 5, y: 5 });
    const clipboardRoot = buildGroup({ childIds: ['child-1'], id: 'group-clip', x: 0, y: 0 });
    const clipboardNodesById = { 'child-1': child, 'group-clip': clipboardRoot };
    const target = buildFrame({ id: 'target-1', parentId: null, x: 50, y: 50 });

    // action
    const result = buildPasteOverNodes(clipboardNodesById, clipboardRoot, target);

    // result — fresh group root at the target's position, its child shifted by the same (50, 50) delta
    const [freshRootId] = result.rootIds;
    const freshRoot = result.nodes.find((node) => node.id === freshRootId);
    const freshChild = result.nodes.find((node) => node.id !== freshRootId);

    expect(freshRoot).toMatchObject({ parentId: null, type: NodeType.group, x: 50, y: 50 });
    expect(freshChild).toMatchObject({ parentId: freshRootId, x: 55, y: 55 });
  });
});
