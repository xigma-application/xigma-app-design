// utils
import { getResizedPosition } from '../getResizedPosition';

describe('getResizedPosition', () => {
  it('should use the plain anchor-transform formula when there is no rotated anchor solver', () => {
    // mock
    const origin = { height: 50, width: 100, x: 0, y: 0 };

    // result — matches the end-to-end "resize a single node from a corner handle" case
    const result = getResizedPosition(origin, { x: 0, y: 0 }, 1.5, 1.6, 150, 80, null);

    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('should defer to the rotated anchor solver when one is provided, ignoring the plain formula', () => {
    // mock
    const origin = { height: 50, width: 100, x: 0, y: 0 };
    const solver = vi.fn((width: number, height: number) => ({ x: width, y: height }));

    // before
    const result = getResizedPosition(origin, { x: 0, y: 0 }, 1.5, 1.6, 150, 80, solver);

    // result — the new width/height, not anything derived from anchors/scale
    expect(solver).toHaveBeenCalledWith(150, 80);
    expect(result).toEqual({ x: 150, y: 80 });
  });
});
