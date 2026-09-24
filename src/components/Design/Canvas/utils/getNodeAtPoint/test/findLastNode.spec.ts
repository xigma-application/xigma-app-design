// types
import { TSceneNode } from 'types/design/types';

// utils
import { findLastNode } from '../findLastNode';

const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as TSceneNode[];

describe('findLastNode', () => {
  it('should return the last node that matches, scanning from the end', () => {
    // before
    const result = findLastNode(nodes, (node) => node.id !== 'c');

    // result
    expect(result?.id).toBe('b');
  });

  it('should return null when nothing matches', () => {
    // result
    expect(findLastNode(nodes, () => false)).toBeNull();
  });

  it('should return null for an empty list', () => {
    // result
    expect(findLastNode([], () => true)).toBeNull();
  });
});
