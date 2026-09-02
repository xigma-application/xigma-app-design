// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { cloneNodeSubtreeWithOffset } from '../cloneNodeSubtreeWithOffset';

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

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

const buildText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'hi',
  fill: '#fff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('cloneNodeSubtreeWithOffset', () => {
  it('should give the cloned root a fresh id, offset its geometry, and clear its parentId', () => {
    // mock
    const a = buildFrame({ id: 'a', x: 0, y: 0 });

    // action
    const result = cloneNodeSubtreeWithOffset([a], ['a'], 10, 20);

    // result
    expect(result.nodes).toHaveLength(1);
    const [clone] = result.nodes;
    expect(clone.id).not.toBe('a');
    expect(clone).toMatchObject({ parentId: null, x: 10, y: 20 });
    expect(result.rootIds).toEqual([clone.id]);
  });

  it('should remap a group’s childIds and its children’s parentId to the cloned ids, keeping the group as the reported root', () => {
    // mock
    const a = buildFrame({ id: 'a', parentId: 'group-1' });
    const b = buildFrame({ id: 'b', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'b'], id: 'group-1' });

    // action
    const result = cloneNodeSubtreeWithOffset([group, a, b], ['group-1'], 0, 0);

    // result
    expect(result.rootIds).toHaveLength(1);
    const [clonedGroupId] = result.rootIds;
    const clonedGroup = result.nodes.find((node) => node.id === clonedGroupId) as TGroupNode;

    expect(clonedGroup.childIds).toHaveLength(2);
    expect(clonedGroup.childIds).not.toEqual(expect.arrayContaining(['a', 'b']));

    clonedGroup.childIds.forEach((childId) => {
      const clonedChild = result.nodes.find((node) => node.id === childId);
      expect(clonedChild?.parentId).toBe(clonedGroupId);
    });
  });

  it('should tolerate a child id in the subtree that has no matching node in the id map, leaving it unmapped', () => {
    // mock — a group whose childIds references an id that was never part of the collected subtree
    const group = buildGroup({ childIds: ['missing'], id: 'group-1' });

    // action
    const result = cloneNodeSubtreeWithOffset([group], ['group-1'], 0, 0);

    // result
    const [clonedGroup] = result.nodes as [TGroupNode];
    expect(clonedGroup.childIds).toEqual(['missing']);
  });

  it('should fall back to null when a node’s parentId is not part of the cloned subtree', () => {
    // mock — a node whose original parentId was never included in the subtree being cloned
    const a = buildFrame({ id: 'a', parentId: 'not-in-subtree' });

    // action
    const result = cloneNodeSubtreeWithOffset([a], ['a'], 0, 0);

    // result
    expect(result.nodes[0].parentId).toBeNull();
  });

  it('should point a cloned text-on-path at its own cloned guide, and add that guide as an extra root', () => {
    // mock — the guide travels in the same batch (collectSubtreeNodes pulls it in) even though it
    // was never one of the original selected roots
    const vector = buildVector();
    const text = buildText({ pathId: vector.id });

    // action
    const result = cloneNodeSubtreeWithOffset([text, vector], [text.id], 0, 0);

    // result — one extra root (the guide) beyond the text's own
    expect(result.rootIds).toHaveLength(2);
    const clonedText = result.nodes.find((node) => node.type === NodeType.text) as TTextNode;
    const clonedVector = result.nodes.find((node) => node.type === NodeType.vector) as TVectorNode;

    expect(clonedText.pathId).toBe(clonedVector.id);
    expect(result.rootIds).toEqual(expect.arrayContaining([clonedText.id, clonedVector.id]));
  });

  it('should fall back the cloned pathId to null when the guide was not part of the cloned batch', () => {
    // mock — a text-on-path cloned on its own, its guide never collected alongside it
    const text = buildText({ pathId: 'not-in-batch' });

    // action
    const result = cloneNodeSubtreeWithOffset([text], [text.id], 0, 0);

    // result — no dangling reference to an id that doesn't exist in this clone batch
    const [clonedText] = result.nodes as [TTextNode];
    expect(clonedText.pathId).toBeNull();
    expect(result.rootIds).toEqual([clonedText.id]);
  });
});
