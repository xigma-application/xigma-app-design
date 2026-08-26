// utils
import { isSelfBacktrack } from '../isSelfBacktrack';

describe('isSelfBacktrack', () => {
  it('should return true for a two-step walk that leaves and re-enters the same segment', () => {
    // result
    expect(
      isSelfBacktrack([
        { fromId: 'a', segmentId: 's1', toId: 'b' },
        { fromId: 'b', segmentId: 's1', toId: 'a' },
      ]),
    ).toBe(true);
  });

  it('should return false for a two-step walk across two different segments', () => {
    // result
    expect(
      isSelfBacktrack([
        { fromId: 'a', segmentId: 's1', toId: 'b' },
        { fromId: 'b', segmentId: 's2', toId: 'a' },
      ]),
    ).toBe(false);
  });

  it('should return false for a walk with more than two steps, even if it starts and ends on the same segment', () => {
    // result
    expect(
      isSelfBacktrack([
        { fromId: 'a', segmentId: 's1', toId: 'b' },
        { fromId: 'b', segmentId: 's2', toId: 'c' },
        { fromId: 'c', segmentId: 's1', toId: 'a' },
      ]),
    ).toBe(false);
  });

  it('should return false for a single-step walk', () => {
    // result
    expect(isSelfBacktrack([{ fromId: 'a', segmentId: 's1', toId: 'b' }])).toBe(false);
  });
});
