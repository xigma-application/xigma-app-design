// utils
import { getResizeBounds } from '../getResizeBounds';

describe('getResizeBounds', () => {
  it('should compute a plain resized rect when Shift is not held', () => {
    // mock
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result
    const result = getResizeBounds('se', bounds, { x: 150, y: 80 }, { x: 0, y: 0 }, 2, false);

    expect(result).toEqual({ height: 80, width: 150, x: 0, y: 0 });
  });

  it('should compute a plain resized rect when Shift is held but there is no corner anchor (edge handle)', () => {
    // mock
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result — no aspect lock on an edge handle, even with Shift held
    const result = getResizeBounds('e', bounds, { x: 150, y: 999 }, null, 2, true);

    expect(result).toEqual({ height: 50, width: 150, x: 0, y: 0 });
  });

  it('should lock the aspect ratio when Shift is held and a corner anchor is present', () => {
    // mock
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // result — height-driven since raw width (150) is proportionally narrower than the 2:1 ratio needs
    const result = getResizeBounds('se', bounds, { x: 150, y: 80 }, { x: 0, y: 0 }, 2, true);

    expect(result).toEqual({ height: 80, width: 160, x: 0, y: 0 });
  });
});
