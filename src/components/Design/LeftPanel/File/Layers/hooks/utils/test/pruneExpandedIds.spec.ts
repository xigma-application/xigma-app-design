// types
import { TSceneNode } from 'types/design/types';

// utils
import { pruneExpandedIds } from '../pruneExpandedIds';

const buildGroupNode = (id: string): TSceneNode =>
  ({ childIds: [], height: 10, id, name: 'Group', parentId: null, rotation: 0, type: 'group', width: 10, x: 0, y: 0 }) as TSceneNode;

describe('pruneExpandedIds', () => {
  it('should drop ids that no longer resolve to a node (deleted from the scene)', () => {
    // mock
    const expandedIds = new Set(['group-1', 'group-2']);
    const nodes = { 'group-1': buildGroupNode('group-1') };

    // before
    const result = pruneExpandedIds(expandedIds, nodes);

    // result
    expect([...result]).toEqual(['group-1']);
  });

  it('should return the exact same Set instance when nothing needs pruning, so callers can bail out of a state update', () => {
    // mock
    const expandedIds = new Set(['group-1']);
    const nodes = { 'group-1': buildGroupNode('group-1') };

    // before
    const result = pruneExpandedIds(expandedIds, nodes);

    // result
    expect(result).toBe(expandedIds);
  });

  it('should return an empty set when every expanded id was deleted', () => {
    // mock
    const expandedIds = new Set(['group-1']);

    // before
    const result = pruneExpandedIds(expandedIds, {});

    // result
    expect(result.size).toBe(0);
  });
});
