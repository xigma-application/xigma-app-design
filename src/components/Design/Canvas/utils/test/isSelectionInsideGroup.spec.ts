// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { isSelectionInsideGroup } from '../isSelectionInsideGroup';

const rect = (id: string, parentId: string | null = null): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const group = (id: string, childIds: string[], parentId: string | null = null): TGroupNode => ({
  childIds,
  height: 10,
  id,
  name: 'Group',
  parentId,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
});

describe('isSelectionInsideGroup', () => {
  const a = rect('a', 'group-1');
  const b = rect('b', 'group-1');
  const other = rect('other', 'group-2');
  const loose = rect('loose');
  const groupNode = group('group-1', ['a', 'b']);
  const otherGroupNode = group('group-2', ['other']);
  const nodesById: Record<string, TSceneNode> = { a, b, 'group-1': groupNode, 'group-2': otherGroupNode, loose, other };

  it('should return true when the single selected node is a child of the given group', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [a], nodesById)).toBe(true);
  });

  it('should return true when every selected node is a child of the given group', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [a, b], nodesById)).toBe(true);
  });

  it('should return false when the selection mixes a child of the group with an unrelated node', () => {
    // mock — the exact regression this guards: a group child selected together with a standalone
    // sibling must not make the group act "entered" for the rest of its own children
    expect(isSelectionInsideGroup('group-1', [a, loose], nodesById)).toBe(false);
  });

  it('should return false when the selection mixes a child of the group with a child of a different group', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [a, other], nodesById)).toBe(false);
  });

  it('should return false when the selection is empty', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [], nodesById)).toBe(false);
  });

  it('should return false when the selected node belongs to a different group', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [other], nodesById)).toBe(false);
  });

  it('should return false when the selected node is the group itself, not one of its children', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [groupNode], nodesById)).toBe(false);
  });

  it('should return false when the selected node has no parent at all', () => {
    // result
    expect(isSelectionInsideGroup('group-1', [loose], nodesById)).toBe(false);
  });
});
