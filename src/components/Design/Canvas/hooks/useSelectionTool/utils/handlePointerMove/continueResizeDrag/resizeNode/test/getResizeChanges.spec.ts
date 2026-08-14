// utils
import { getResizeChanges } from '../getResizeChanges';

describe('getResizeChanges', () => {
  it('should omit flipX/flipY entirely for a node with no flip support', () => {
    // result
    const result = getResizeChanges({ flip: null, rotation: 0 }, 1.5, 1.6, true, 80, 150, 0, 0);

    expect(result).toEqual({ height: 80, width: 150, x: 0, y: 0 });
  });

  it('should snap x/y to whole pixels for an unrotated node', () => {
    // result
    const result = getResizeChanges({ flip: null, rotation: 0 }, 1.5, 1.6, true, 80, 150, 12.6, 7.4);

    expect(result).toMatchObject({ x: 13, y: 7 });
  });

  it('should leave x/y as sub-pixel floats for a rotated node, instead of snapping to whole pixels', () => {
    // result — rounding would perturb the anchor corner the caller already solved for exactly
    const result = getResizeChanges({ flip: null, rotation: 30 }, 1.5, 1.6, true, 80, 150, 12.345, 7.891);

    expect(result).toMatchObject({ x: 12.345, y: 7.891 });
  });

  it('should toggle flip on a single (rotated or not) node using the raw scale sign', () => {
    // mock — negative scaleX signals a crossed anchor on the X axis
    // result
    const result = getResizeChanges({ flip: { x: false, y: false }, rotation: 0 }, -0.3, 1, true, 100, 30, -30, 0);

    expect(result).toMatchObject({ flipX: true, flipY: false });
  });

  it("should toggle flip on a rotated GROUP member using its own local axis, not the group's raw world sign", () => {
    // mock — a world-X crossing (negative) should read as the local-Y sign at 90deg, per getRotatedAxisSigns
    // result
    const result = getResizeChanges({ flip: { x: false, y: false }, rotation: 90 }, -2, 1, false, 100, 100, 0, 0);

    expect(result).toMatchObject({ flipX: false, flipY: true });
  });
});
