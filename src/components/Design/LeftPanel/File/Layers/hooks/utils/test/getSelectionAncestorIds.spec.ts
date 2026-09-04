// types
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionAncestorIds } from '../getSelectionAncestorIds';

const node = (id: string, parentId: string | null): TSceneNode => ({ id, parentId }) as TSceneNode;

describe('getSelectionAncestorIds', () => {
  it('should return an empty set for a root-level selection', () => {
    const nodes = { r1: node('r1', null) };

    expect(getSelectionAncestorIds(['r1'], nodes)).toEqual(new Set());
  });

  it("should return the node's parent for a single level of nesting", () => {
    const nodes = { f1: node('f1', null), r1: node('r1', 'f1') };

    expect(getSelectionAncestorIds(['r1'], nodes)).toEqual(new Set(['f1']));
  });

  it('should walk the full parent chain for deep nesting', () => {
    const nodes = { f1: node('f1', null), f2: node('f2', 'f1'), r1: node('r1', 'f2') };

    expect(getSelectionAncestorIds(['r1'], nodes)).toEqual(new Set(['f1', 'f2']));
  });

  it('should union the ancestor chains of every selected node without duplicates', () => {
    const nodes = { f1: node('f1', null), r1: node('r1', 'f1'), r2: node('r2', 'f1') };

    expect(getSelectionAncestorIds(['r1', 'r2'], nodes)).toEqual(new Set(['f1']));
  });

  it('should skip an id missing from the node map instead of throwing', () => {
    const nodes = { f1: node('f1', null), r1: node('r1', 'f1') };

    expect(getSelectionAncestorIds(['ghost', 'r1'], nodes)).toEqual(new Set(['f1']));
  });

  it('should return an empty set for an empty selection', () => {
    expect(getSelectionAncestorIds([], {})).toEqual(new Set());
  });

  it('should not loop forever on a corrupted cyclic parent chain', () => {
    const nodes = { a: node('a', 'b'), b: node('b', 'a') };

    expect(getSelectionAncestorIds(['a'], nodes)).toEqual(new Set(['b', 'a']));
  });
});
