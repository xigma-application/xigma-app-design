// utils
import { findMatchingNode } from '../findMatchingNode';
import { getMatchingScope } from '../getMatchingScope';
import { matchingNodesById } from './matchingLayersFixtures';

const scopeOf = (nodeId: string): NonNullable<ReturnType<typeof getMatchingScope>> =>
  getMatchingScope(matchingNodesById[nodeId], matchingNodesById) as NonNullable<ReturnType<typeof getMatchingScope>>;

describe('findMatchingNode', () => {
  it('should find the node with the same names along the same path', () => {
    // result
    expect(findMatchingNode(scopeOf('titleA'), matchingNodesById.screenB, matchingNodesById)?.id).toBe('titleB');
  });

  it('should return null when the hierarchy depth differs', () => {
    // result
    expect(findMatchingNode(scopeOf('titleA'), matchingNodesById.screenC, matchingNodesById)).toBeNull();
  });

  it('should match same-named siblings by their occurrence index', () => {
    // result
    expect(findMatchingNode(scopeOf('cardA1'), matchingNodesById.screenB, matchingNodesById)?.id).toBe('cardB1');
    expect(findMatchingNode(scopeOf('cardA2'), matchingNodesById.screenB, matchingNodesById)).toBeNull();
  });
});
