// utils
import { pickClosestAngleMatch } from '../pickClosestAngleMatch';

describe('pickClosestAngleMatch', () => {
  it('should pick the candidate whose angle is closest to the target angle', () => {
    // mock
    const candidates = [
      { angle: 0, segmentId: 's1' },
      { angle: 90, segmentId: 's2' },
    ];

    // action
    const match = pickClosestAngleMatch(candidates, 80);

    // result
    expect(match).toEqual({ angle: 90, segmentId: 's2' });
  });

  it('should wrap around the 360°/0° boundary when measuring angular distance', () => {
    // mock — a target at -10° (350°) is only 20° from the 350° candidate, not 340° from it the naive way
    const candidates = [
      { angle: 10, segmentId: 's1' },
      { angle: 350, segmentId: 's2' },
    ];

    // action
    const match = pickClosestAngleMatch(candidates, -10);

    // result
    expect(match).toEqual({ angle: 350, segmentId: 's2' });
  });

  it('should keep the first candidate when it is already closer than every later one', () => {
    // mock — the second candidate (0°) is further from the 80° target than the first (90°), so the reduce
    // must keep its running best instead of switching to it
    const candidates = [
      { angle: 90, segmentId: 's1' },
      { angle: 0, segmentId: 's2' },
    ];

    // action
    const match = pickClosestAngleMatch(candidates, 80);

    // result
    expect(match).toEqual({ angle: 90, segmentId: 's1' });
  });

  it('should still pick correctly when the raw modulo distance exceeds 180° before wrapping', () => {
    // mock — comparing against the 0° candidate needs the > 180° wrap (190% -> 170%); the 180° candidate
    // doesn't, so this single call exercises both branches of the wrap
    const candidates = [
      { angle: 0, segmentId: 's1' },
      { angle: 180, segmentId: 's2' },
    ];

    // action
    const match = pickClosestAngleMatch(candidates, 190);

    // result
    expect(match).toEqual({ angle: 180, segmentId: 's2' });
  });

  it('should return the only candidate when there is just one', () => {
    // mock
    const candidates = [{ angle: 45, segmentId: 's1' }];

    // action
    const match = pickClosestAngleMatch(candidates, -170);

    // result
    expect(match).toEqual({ angle: 45, segmentId: 's1' });
  });
});
