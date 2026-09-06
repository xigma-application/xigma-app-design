// utils
import { getContiguousMemberSlots } from '../getContiguousMemberSlots';

const sizes = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];

describe('getContiguousMemberSlots', () => {
  it('lays the members out touching along the primary axis of a horizontal frame, with the item spacing', () => {
    expect(getContiguousMemberSlots(true, sizes, 10)).toEqual([
      { x: 0, y: 0 },
      { x: 110, y: 0 },
      { x: 220, y: 0 },
    ]);
  });

  it('stacks them along the primary axis of a vertical frame', () => {
    expect(getContiguousMemberSlots(false, sizes, 0)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 0, y: 200 },
    ]);
  });

  it('returns nothing for an empty block', () => {
    expect(getContiguousMemberSlots(true, [], 10)).toEqual([]);
  });
});
