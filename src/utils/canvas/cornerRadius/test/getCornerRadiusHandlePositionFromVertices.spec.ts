// utils
import { getCornerRadiusHandlePositionFromVertices } from '../getCornerRadiusHandlePositionFromVertices';

const effectiveSetbackMock = vi.fn();

vi.mock('../getCornerRadiusHandleEffectiveSetback', () => ({
  getCornerRadiusHandleEffectiveSetback: (...args: unknown[]): unknown => effectiveSetbackMock(...args),
}));
vi.mock('../getCornerRadiusHandleSetbackMultiplier', () => ({ getCornerRadiusHandleSetbackMultiplier: (): number => 2 }));

const vertices = [
  { x: 0, y: 0 },
  { x: 10, y: 20 },
  { x: -10, y: 20 },
];
const center = { x: 0, y: 10 };

describe('getCornerRadiusHandlePositionFromVertices', () => {
  beforeEach(() => {
    effectiveSetbackMock.mockReset().mockReturnValue(4);
  });

  it('should set the handle back from the top vertex toward the center', () => {
    // before
    const position = getCornerRadiusHandlePositionFromVertices(vertices, center, 8, 3, { x: 0, y: 0, zoom: 1 });

    // result
    expect(position).toEqual({ x: 0, y: 4 });
    expect(effectiveSetbackMock).toHaveBeenCalledWith(3, 8, 2, 30, false);
  });

  it('should keep the zero-radius gap at least the minimum screen gap when zoomed in', () => {
    // before
    getCornerRadiusHandlePositionFromVertices(vertices, center, 8, 0, { x: 0, y: 0, zoom: 4 }, false, false, true);

    // result
    expect(effectiveSetbackMock).toHaveBeenCalledWith(0, 8, 2, 12 / 4, true);
  });

  it('should cap the zero-radius gap at the default offset when zoomed out', () => {
    // before
    getCornerRadiusHandlePositionFromVertices(vertices, center, 8, 0, { x: 0, y: 0, zoom: 0.5 });

    // result
    expect(effectiveSetbackMock).toHaveBeenCalledWith(0, 8, 2, 30 / 0.5, false);
  });

  it('should mirror the handle around the center for a flipped shape', () => {
    // before
    const position = getCornerRadiusHandlePositionFromVertices(vertices, center, 8, 3, { x: 0, y: 0, zoom: 1 }, true, true);

    // result
    expect(position).toEqual({ x: 0, y: 16 });
  });
});
