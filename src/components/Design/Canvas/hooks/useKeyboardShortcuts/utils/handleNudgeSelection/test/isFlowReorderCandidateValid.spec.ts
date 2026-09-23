// utils
import { isFlowReorderCandidateValid } from '../isFlowReorderCandidateValid';
import { TFlowAxisMove } from '../getFlowAxisMove';

const primaryForward: TFlowAxisMove = { direction: 1, kind: 'primary' };
const crossForward: TFlowAxisMove = { direction: 1, kind: 'cross' };
const crossBackward: TFlowAxisMove = { direction: -1, kind: 'cross' };

describe('isFlowReorderCandidateValid', () => {
  it('should always accept a primary move without inspecting the candidate lines', () => {
    expect(isFlowReorderCandidateValid([], ['a'], primaryForward)).toBe(true);
  });

  it('should accept a cross-forward candidate when the block genuinely starts its landing line', () => {
    const candidateLineGroups = [
      ['b', 'c'],
      ['a', 'd'],
    ];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['a'], crossForward)).toBe(true);
  });

  it('should reject a cross-forward candidate when the block was reabsorbed mid-line instead of starting a fresh one', () => {
    const candidateLineGroups = [
      ['b', 'a'],
      ['c', 'd'],
    ];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['a'], crossForward)).toBe(false);
  });

  it('should accept a cross-backward candidate when the block ends up at the end of its landing line', () => {
    const candidateLineGroups = [['a', 'b', 'd'], ['c']];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['d'], crossBackward)).toBe(true);
  });

  it('should also accept a cross-backward candidate when the block ends up in the MIDDLE of its landing line — a backward move may legitimately swap it into any position, not just the edge', () => {
    const candidateLineGroups = [
      ['a', 'b'],
      ['d', 'c'],
    ];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['d'], crossBackward)).toBe(true);
  });

  it('should reject when the moved block ends up split across two lines on a cross-forward move', () => {
    const candidateLineGroups = [['b', 'a'], ['c']];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['a', 'c'], crossForward)).toBe(false);
  });

  it('should reject when the moved block ends up split across two lines on a cross-backward move too', () => {
    const candidateLineGroups = [['b', 'a'], ['c']];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['a', 'c'], crossBackward)).toBe(false);
  });

  it('should reject when the moved block’s first id isn’t found in any line', () => {
    const candidateLineGroups = [['b', 'c']];

    expect(isFlowReorderCandidateValid(candidateLineGroups, ['a'], crossForward)).toBe(false);
  });
});
