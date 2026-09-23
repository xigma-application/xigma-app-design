// utils
import { getMatchingLayerIds } from '../getMatchingLayerIds';
import { matchingNodesById, matchingRootOrder } from './matchingLayersFixtures';

describe('getMatchingLayerIds', () => {
  it('should add the matching layers from other top-level frames', () => {
    // result
    expect(getMatchingLayerIds(['titleA'], matchingNodesById, matchingRootOrder)).toEqual(['titleA', 'titleB']);
  });

  it('should only match inside the same section', () => {
    // result
    expect(getMatchingLayerIds(['titleD'], matchingNodesById, matchingRootOrder)).toEqual(['titleD', 'titleE']);
  });

  it('should keep the selection unchanged when nothing matches', () => {
    // result
    expect(getMatchingLayerIds(['cardA2'], matchingNodesById, matchingRootOrder)).toEqual(['cardA2']);
  });

  it('should merge the matches of every selected node without duplicates', () => {
    // result
    expect(getMatchingLayerIds(['titleA', 'cardA1', 'titleB'], matchingNodesById, matchingRootOrder)).toEqual([
      'titleA',
      'cardA1',
      'titleB',
      'cardB1',
    ]);
  });

  it('should ignore selected ids missing from the nodes record', () => {
    // result
    expect(getMatchingLayerIds(['missing'], matchingNodesById, matchingRootOrder)).toEqual(['missing']);
  });

  it('should ignore top-level selected nodes', () => {
    // result
    expect(getMatchingLayerIds(['screenA'], matchingNodesById, matchingRootOrder)).toEqual(['screenA']);
  });
});
