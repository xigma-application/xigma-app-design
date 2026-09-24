// types
import { TAxisEdges } from '../getAxisEdges';

// utils
import { isChainCandidateMatch } from '../isChainCandidateMatch';

const ACTIVE: TAxisEdges = { breadth: 10, centre: 50, far: 60, length: 10, near: 50 };

describe('isChainCandidateMatch', () => {
  it('should accept a candidate of the same size that is centred on the active shape', () => {
    // result
    expect(isChainCandidateMatch({ ...ACTIVE, far: 110, near: 100 }, ACTIVE, 0.5, 0.5)).toBe(true);
  });

  it('should accept differences within the tolerances', () => {
    // result
    expect(isChainCandidateMatch({ ...ACTIVE, breadth: 10.4, centre: 50.4, length: 9.6 }, ACTIVE, 0.5, 0.5)).toBe(true);
  });

  it.each([
    ['length', { length: 11 }],
    ['breadth', { breadth: 11 }],
    ['centre', { centre: 52 }],
  ])('should reject a candidate whose %s is off', (_, override) => {
    // result
    expect(isChainCandidateMatch({ ...ACTIVE, ...override }, ACTIVE, 0.5, 0.5)).toBe(false);
  });
});
