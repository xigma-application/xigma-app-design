// types
import { TSceneNode } from 'types/design/types';

// utils
import { getIsDescendantOfMovedIdSet } from '../getIsDescendantOfMovedIdSet';

const node = (id: string, parentId: string | null): TSceneNode => ({ id, parentId }) as unknown as TSceneNode;

const nodesById: Record<string, TSceneNode> = {
  child: node('child', 'mid'),
  mid: node('mid', 'root'),
  root: node('root', null),
};

describe('getIsDescendantOfMovedIdSet', () => {
  it('should be false for a null target parent', () => {
    // result
    expect(getIsDescendantOfMovedIdSet(null, new Set(['root']), nodesById)).toBe(false);
  });

  it('should be true when the target itself is in the moved set', () => {
    // result
    expect(getIsDescendantOfMovedIdSet('mid', new Set(['mid']), nodesById)).toBe(true);
  });

  it('should be true when an ancestor of the target is in the moved set', () => {
    // result
    expect(getIsDescendantOfMovedIdSet('child', new Set(['root']), nodesById)).toBe(true);
  });

  it('should be false when no node on the path to the root is moved', () => {
    // result
    expect(getIsDescendantOfMovedIdSet('child', new Set(['other']), nodesById)).toBe(false);
  });

  it('should stop at a parent id that is missing from the record', () => {
    // result
    expect(getIsDescendantOfMovedIdSet('ghost', new Set(['root']), nodesById)).toBe(false);
  });
});
