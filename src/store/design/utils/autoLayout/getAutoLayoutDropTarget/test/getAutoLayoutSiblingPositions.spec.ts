// utils
import { getAutoLayoutSiblingPositions } from '../getAutoLayoutSiblingPositions';

describe('getAutoLayoutSiblingPositions', () => {
  it('should map every real sibling to its own simulated position', () => {
    // action
    const positions = getAutoLayoutSiblingPositions([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0, y: 40 },
    ]);

    // result
    expect(positions).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 40 } });
  });

  it('should never include the dragged placeholder itself', () => {
    // action
    const positions = getAutoLayoutSiblingPositions([
      { id: 'a', x: 0, y: 0 },
      { id: '__dragged__', x: 0, y: 20 },
    ]);

    // result — specifically not `{ __dragged__: ... }`
    expect(positions).toEqual({ a: { x: 0, y: 0 } });
  });

  it('should return an empty map for an empty list of positions', () => {
    // action
    const positions = getAutoLayoutSiblingPositions([]);

    // result
    expect(positions).toEqual({});
  });
});
