// utils
import { getCandidateTops } from '../getCandidateTops';
import { matchingNodesById, matchingRootOrder } from './matchingLayersFixtures';

describe('getCandidateTops', () => {
  it('should return the other top-level containers, skipping shapes and sections', () => {
    // result
    expect(getCandidateTops(matchingNodesById.screenA, matchingNodesById, matchingRootOrder).map((node) => node.id)).toEqual([
      'screenB',
      'screenC',
    ]);
  });

  it('should only return siblings from the same section', () => {
    // result
    expect(getCandidateTops(matchingNodesById.screenD, matchingNodesById, matchingRootOrder).map((node) => node.id)).toEqual(['screenE']);
  });

  it('should skip ids missing from the nodes record', () => {
    // result
    expect(getCandidateTops(matchingNodesById.screenA, matchingNodesById, ['missing', 'screenB']).map((node) => node.id)).toEqual([
      'screenB',
    ]);
  });
});
