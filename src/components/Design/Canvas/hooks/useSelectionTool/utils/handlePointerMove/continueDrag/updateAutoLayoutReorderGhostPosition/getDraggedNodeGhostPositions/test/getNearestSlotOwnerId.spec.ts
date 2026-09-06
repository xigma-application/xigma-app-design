// utils
import { getNearestSlotOwnerId } from '../getNearestSlotOwnerId';

describe('getNearestSlotOwnerId', () => {
  it('should return the id of the slot closest to the target point', () => {
    // mock
    const slots = { a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 200, y: 0 } };

    // before
    const ownerId = getNearestSlotOwnerId(slots, { x: 120, y: 10 });

    // result
    expect(ownerId).toBe('b');
  });

  it('should keep the first slot when no other slot is strictly closer', () => {
    // mock
    const slots = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };

    // before — target sits exactly between the two slots
    const ownerId = getNearestSlotOwnerId(slots, { x: 5, y: 0 });

    // result
    expect(ownerId).toBe('a');
  });
});
