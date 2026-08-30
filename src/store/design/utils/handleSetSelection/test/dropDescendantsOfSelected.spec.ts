// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { dropDescendantsOfSelected } from '../dropDescendantsOfSelected';

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

const child = rect('child', 'group');
const sibling = rect('sibling', 'group');
const outsider = rect('outsider');
const inner = group('inner', ['grandchild'], 'group');
const grandchild = rect('grandchild', 'inner');
const parent = group('group', ['child', 'sibling', 'inner']);
const nodes: Record<string, TSceneNode> = {
  child,
  grandchild,
  group: parent,
  inner,
  outsider,
  sibling,
};

describe('dropDescendantsOfSelected', () => {
  it('should drop a child whose ancestor group is also selected', () => {
    expect(dropDescendantsOfSelected(['child', 'group'], nodes)).toEqual(['group']);
  });

  it('should drop a deeply nested descendant when a higher ancestor is selected', () => {
    expect(dropDescendantsOfSelected(['group', 'grandchild'], nodes)).toEqual(['group']);
  });

  it('should keep a child when its ancestor group is not selected', () => {
    expect(dropDescendantsOfSelected(['child', 'outsider'], nodes)).toEqual(['child', 'outsider']);
  });

  it('should keep sibling selections that share no ancestor with each other', () => {
    expect(dropDescendantsOfSelected(['child', 'sibling'], nodes)).toEqual(['child', 'sibling']);
  });

  it('should preserve the original order of the surviving ids', () => {
    expect(dropDescendantsOfSelected(['outsider', 'child', 'group'], nodes)).toEqual(['outsider', 'group']);
  });

  it('should leave ids that no longer resolve to a node untouched', () => {
    expect(dropDescendantsOfSelected(['ghost', 'group'], nodes)).toEqual(['ghost', 'group']);
  });
});
