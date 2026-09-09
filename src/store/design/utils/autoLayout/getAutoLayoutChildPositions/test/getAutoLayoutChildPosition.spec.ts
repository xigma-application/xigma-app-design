// utils
import { getAutoLayoutChildPosition } from '../getAutoLayoutChildPosition';

const child = { height: 20, id: 'a', width: 30 };
const frame = { height: 100, width: 200, x: 100, y: 200 };

describe('getAutoLayoutChildPosition', () => {
  it('should place a horizontal child at the given primary offset, packed at the counter axis start', () => {
    const position = getAutoLayoutChildPosition(child, true, frame, 40, 'start', 100, false, 0);

    expect(position).toEqual({ height: 20, id: 'a', width: 30, x: 140, y: 200 });
  });

  it('should centre a horizontal child on the counter axis when the counter align is "center"', () => {
    const position = getAutoLayoutChildPosition(child, true, frame, 0, 'center', 100, false, 0);

    // counter offset = (100 - 20) / 2 = 40
    expect(position).toEqual({ height: 20, id: 'a', width: 30, x: 100, y: 240 });
  });

  it('should apply the counter offset to x instead of y for a vertical child', () => {
    const position = getAutoLayoutChildPosition(child, false, frame, 40, 'center', 100, false, 0);

    // counter offset = (100 - 30) / 2 = 35, applied to x; primary offset applied to y
    expect(position).toEqual({ height: 20, id: 'a', width: 30, x: 135, y: 240 });
  });

  it('should offset by the baseline difference instead of the normal counter alignment, when baseline aligning', () => {
    const position = getAutoLayoutChildPosition(child, true, frame, 0, 'center', 100, true, 30);

    // child has no fontSize, so its own baseline offset is its height (20); 30 - 20 = 10
    expect(position).toEqual({ height: 20, id: 'a', width: 30, x: 100, y: 210 });
  });
});
