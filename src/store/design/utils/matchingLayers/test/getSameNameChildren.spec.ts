// utils
import { getSameNameChildren } from '../getSameNameChildren';
import { matchingNodesById } from './matchingLayersFixtures';

describe('getSameNameChildren', () => {
  it('should return the children with the given name in order', () => {
    // result
    expect(getSameNameChildren(matchingNodesById.screenA, 'Card', matchingNodesById).map((node) => node.id)).toEqual(['cardA1', 'cardA2']);
  });

  it('should return an empty array when no child has the name', () => {
    // result
    expect(getSameNameChildren(matchingNodesById.screenA, 'Missing', matchingNodesById)).toEqual([]);
  });

  it('should return an empty array for a node without children', () => {
    // result
    expect(getSameNameChildren(matchingNodesById.loose, 'Card', matchingNodesById)).toEqual([]);
  });
});
