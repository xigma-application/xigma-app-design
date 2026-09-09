// utils
import { getWrappedLineChildPosition } from '../getWrappedLineChildPosition';

const child = { height: 20, id: 'a', width: 30 };
const frame = { height: 100, width: 200, x: 100, y: 200 };

describe('getWrappedLineChildPosition', () => {
  it('should apply the primary offset to x and the counter offset to y, for a horizontal line', () => {
    const position = getWrappedLineChildPosition(child, true, frame, 40, 5, 10);

    expect(position).toEqual({ height: 20, id: 'a', width: 30, x: 140, y: 215 });
  });

  it('should apply the counter offset to x and the primary offset to y, for a vertical line', () => {
    const position = getWrappedLineChildPosition(child, false, frame, 40, 5, 10);

    expect(position).toEqual({ height: 20, id: 'a', width: 30, x: 115, y: 240 });
  });
});
