// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { remapClonedRootId } from '../remapClonedRootId';

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

describe('remapClonedRootId', () => {
  it("should rename the root's own id and reparent it under the target's original parent", () => {
    // mock
    const root = buildFrame({ id: 'fresh-root', parentId: null });

    // action
    const result = remapClonedRootId([root], 'fresh-root', 'target-id', 'target-parent');

    // result
    expect(result).toEqual([{ ...root, id: 'target-id', parentId: 'target-parent' }]);
  });

  it("should repoint a direct child's parentId to the new root id, leaving the child's own id untouched", () => {
    // mock
    const root = buildGroup({ childIds: ['child-1'], id: 'fresh-root' });
    const child = buildFrame({ id: 'child-1', parentId: 'fresh-root' });

    // action
    const result = remapClonedRootId([root, child], 'fresh-root', 'target-id', null);

    // result
    expect(result).toEqual([
      { ...root, childIds: ['child-1'], id: 'target-id', parentId: null },
      { ...child, parentId: 'target-id' },
    ]);
  });

  it("should leave a grandchild's parentId untouched, since it already points to its own (unrenamed) immediate parent", () => {
    // mock
    const root = buildGroup({ childIds: ['inner'], id: 'fresh-root' });
    const inner = buildGroup({ childIds: ['leaf'], id: 'inner', parentId: 'fresh-root' });
    const leaf = buildFrame({ id: 'leaf', parentId: 'inner' });

    // action
    const result = remapClonedRootId([root, inner, leaf], 'fresh-root', 'target-id', null);

    // result
    expect(result.find((node) => node.id === 'inner')).toMatchObject({ parentId: 'target-id' });
    expect(result.find((node) => node.id === 'leaf')).toMatchObject({ parentId: 'inner' });
  });
});
