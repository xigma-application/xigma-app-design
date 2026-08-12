// utils
import { toDraftRect } from '../toDraftRect';

describe('toDraftRect', () => {
  it('should normalize the rect when dragging towards the bottom right', () => {
    // before
    const rect = toDraftRect({ x: 10, y: 10 }, { x: 60, y: 40 });

    // result
    expect(rect).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });

  it('should normalize the rect when dragging towards the top left', () => {
    // before
    const rect = toDraftRect({ x: 60, y: 40 }, { x: 10, y: 10 });

    // result
    expect(rect).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });
});
