// utils
import { getBlockMemberTargetOffset } from '../getBlockMemberTargetOffset';

const F0 = { x: 0, y: 200 };
const F1 = { x: 100, y: 200 };

describe('getBlockMemberTargetOffset', () => {
  it('gives the grabbed member a zero offset — it rides the cursor', () => {
    // action
    const offset = getBlockMemberTargetOffset('c', 'c', 'c', F0, F0, F0);

    // result
    expect(offset).toEqual({ x: 0, y: 0 });
  });

  it('offsets a companion to its own footprint slot relative to the slot under the cursor', () => {
    // action — cursor is over the grabbed member’s own slot F0; companion 'd' keeps its own slot F1
    const offset = getBlockMemberTargetOffset('d', 'c', 'c', F0, F0, F1);

    // result
    expect(offset).toEqual({ x: 100, y: 0 });
  });

  it('sends a companion to the grabbed member’s vacated slot when the cursor is over the companion’s slot', () => {
    // action — cursor is over 'd'’s slot F1, so 'd' takes the grabbed member’s home slot F0
    const offset = getBlockMemberTargetOffset('d', 'c', 'd', F1, F0, F1);

    // result — F0 - F1
    expect(offset).toEqual({ x: -100, y: 0 });
  });
});
