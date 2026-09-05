// utils
import { getAutoLayoutInsertedPosition } from '../getAutoLayoutInsertedPosition';

describe('getAutoLayoutInsertedPosition', () => {
  it('should return the simulated position untouched when inserting at the very start', () => {
    // action
    const position = getAutoLayoutInsertedPosition(true, 10, 0, [], [], { x: 50, y: 50 });

    // result
    expect(position).toEqual({ x: 50, y: 50 });
  });

  it('should land halfway through the gap after the previous sibling, on the horizontal axis', () => {
    // action — previous sibling spans x0-20, 10px item spacing
    const position = getAutoLayoutInsertedPosition(true, 10, 1, [{ id: 'a', x: 0, y: 0 }], [{ height: 20, id: 'a', width: 20 }], {
      x: 999,
      y: 5,
    });

    // result — primary axis comes from the previous sibling's own edge, not the simulated one
    expect(position).toEqual({ x: 25, y: 5 });
  });

  it('should land halfway through the gap after the previous sibling, on the vertical axis', () => {
    // action — previous sibling spans y0-20, 10px item spacing
    const position = getAutoLayoutInsertedPosition(false, 10, 1, [{ id: 'a', x: 0, y: 0 }], [{ height: 20, id: 'a', width: 20 }], {
      x: 5,
      y: 999,
    });

    // result
    expect(position).toEqual({ x: 5, y: 25 });
  });
});
