// types
import { TEqualSpacingCandidate } from '../../../types';

// utils
import { getAxisEdges } from '../getAxisEdges';
import { getEdges } from '../../../../getDistanceGuides/getEdges';
import { getMatchingChainCandidates } from '../getMatchingChainCandidates';

const candidate = (x: number, y: number, width = 10, height = 10): TEqualSpacingCandidate =>
  ({ bounds: { height, width, x, y }, id: `${x}-${y}` }) as unknown as TEqualSpacingCandidate;

describe('getMatchingChainCandidates', () => {
  it('should keep only same-sized, centred candidates and preserve their order', () => {
    // mock
    const active = getAxisEdges(getEdges({ height: 10, width: 10, x: 0, y: 0 }), 'horizontal');
    const sameRow = candidate(20, 0);
    const otherRow = candidate(20, 30);
    const bigger = candidate(40, 0, 20, 10);
    const sameRowFar = candidate(60, 0);

    // before
    const result = getMatchingChainCandidates([sameRow, otherRow, bigger, sameRowFar], active, 'horizontal', 0.5, 0.5);

    // result
    expect(result).toEqual([sameRow, sameRowFar]);
  });

  it('should return an empty list when nothing matches', () => {
    // mock
    const active = getAxisEdges(getEdges({ height: 10, width: 10, x: 0, y: 0 }), 'vertical');

    // result
    expect(getMatchingChainCandidates([candidate(0, 0, 50, 50)], active, 'vertical', 0.5, 0.5)).toEqual([]);
  });
});
