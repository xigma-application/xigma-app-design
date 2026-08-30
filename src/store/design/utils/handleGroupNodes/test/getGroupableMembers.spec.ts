// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getGroupableMembers } from '../getGroupableMembers';

const buildRect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getGroupableMembers', () => {
  it('should allow grouping a single selected node by itself, so a group can always be wrapped in another group', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });

    // action & result
    expect(getGroupableMembers([a])).toEqual({ memberNodes: [a], parentId: 'group-1' });
  });

  it('should return null when nothing is selected', () => {
    // action & result
    expect(getGroupableMembers([])).toBeNull();
  });

  it('should return every selected node as a member, targeting the first selected node’s parent, even across different parents', () => {
    // mock — 'a' is selected first, from a different parent than 'b'; the first selected node's
    // parent wins as the target, and every selected node becomes a member regardless of where it
    // currently lives (see handleGroupNodes, which "steals" the others into that target)
    const a = buildRect({ id: 'a', parentId: null });
    const b = buildRect({ id: 'b', parentId: 'other-parent' });

    // action & result
    expect(getGroupableMembers([a, b])).toEqual({ memberNodes: [a, b], parentId: null });
  });

  it('should target the parent of whichever node was selected first', () => {
    // mock — same two nodes, but 'b' selected first this time
    const a = buildRect({ id: 'a', parentId: null });
    const b = buildRect({ id: 'b', parentId: 'other-parent' });

    // action & result
    expect(getGroupableMembers([b, a])).toEqual({ memberNodes: [b, a], parentId: 'other-parent' });
  });
});
