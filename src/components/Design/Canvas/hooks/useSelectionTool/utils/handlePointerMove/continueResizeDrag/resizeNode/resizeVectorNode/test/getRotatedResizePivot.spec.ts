// utils
import { getRotatedResizePivot } from '../getRotatedResizePivot';

describe('getRotatedResizePivot', () => {
  it('should ask the solver for the scaled width/height and center the pivot on the solved position', () => {
    // mock
    const originBounds = { height: 10, width: 20, x: 0, y: 0 };
    const rotatedAnchorSolver = vi.fn().mockReturnValue({ x: 100, y: 50 });

    // before — bounds scaled by (2, 3) -> a 40x30 box asked of the solver
    const pivot = getRotatedResizePivot(originBounds, 2, 3, rotatedAnchorSolver);

    // result
    expect(rotatedAnchorSolver).toHaveBeenCalledWith(40, 30);
    expect(pivot).toEqual({ x: 120, y: 65 });
  });

  it('should use the absolute value of a negative scale, since a mirrored box still has a positive size', () => {
    // mock
    const originBounds = { height: 10, width: 20, x: 5, y: 5 };
    const rotatedAnchorSolver = vi.fn().mockReturnValue({ x: 0, y: 0 });

    // before
    getRotatedResizePivot(originBounds, -2, -1, rotatedAnchorSolver);

    // result
    expect(rotatedAnchorSolver).toHaveBeenCalledWith(40, 10);
  });
});
