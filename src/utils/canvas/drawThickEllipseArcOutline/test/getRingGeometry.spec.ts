// utils
import { getRingGeometry } from '../getRingGeometry';

const getEllipseArcPointsMock = vi.fn();
const getQuadVerticesMock = vi.fn();
const rotatePointMock = vi.fn();

vi.mock('../../shapes/getEllipseArcPoints', () => ({
  getEllipseArcPoints: (...args: unknown[]): unknown => getEllipseArcPointsMock(...args),
}));
vi.mock('../../getQuadVertices', () => ({
  getQuadVertices: (...args: unknown[]): unknown => getQuadVerticesMock(...args),
}));
vi.mock('utils/math/rotatePoint', () => ({
  rotatePoint: (...args: unknown[]): unknown => rotatePointMock(...args),
}));

const RECT = { height: 100, width: 100, x: 0, y: 0 };
const CENTER = { x: 50, y: 50 };

describe('getRingGeometry', () => {
  beforeEach(() => {
    getEllipseArcPointsMock.mockClear();
    getQuadVerticesMock.mockClear();
    rotatePointMock.mockClear();
    getEllipseArcPointsMock.mockReturnValue([]);
    rotatePointMock.mockImplementation((point) => point);
  });

  it('should expand the rect outward and inward by halfWidth before tracing the outer and inner arcs', () => {
    // before
    getRingGeometry(RECT, 5, 0, 90, CENTER, false, false, 0);

    // result
    expect(getEllipseArcPointsMock).toHaveBeenNthCalledWith(1, { height: 110, width: 110, x: -5, y: -5 }, 0, 90, expect.any(Number), 1);
    expect(getEllipseArcPointsMock).toHaveBeenNthCalledWith(2, { height: 90, width: 90, x: 5, y: 5 }, 0, 90, expect.any(Number), 1);
  });

  it('should trace the rim along the unexpanded rect', () => {
    // before
    getRingGeometry(RECT, 5, 0, 90, CENTER, false, false, 0);

    // result
    expect(getEllipseArcPointsMock).toHaveBeenNthCalledWith(3, RECT, 0, 90, expect.any(Number), 1);
  });

  it('should mirror traced points across the center when flipX/flipY are set', () => {
    // mock
    getEllipseArcPointsMock.mockReturnValue([{ x: 60, y: 55 }]);

    // before
    getRingGeometry(RECT, 5, 0, 90, CENTER, true, true, 0);

    // result
    expect(rotatePointMock).toHaveBeenCalledWith({ x: 40, y: 45 }, CENTER, 0);
  });

  it('should rotate every traced point around the center', () => {
    // mock
    const rotatedPoint = { x: 15, y: 20 };
    getEllipseArcPointsMock.mockReturnValue([{ x: 10, y: 5 }]);
    rotatePointMock.mockReturnValue(rotatedPoint);

    // before
    const result = getRingGeometry(RECT, 5, 0, 90, CENTER, false, false, 45);

    // result
    expect(rotatePointMock).toHaveBeenCalledWith({ x: 10, y: 5 }, CENTER, 45);
    expect(result.rimPoints).toEqual([rotatedPoint]);
  });

  it('should return the rim points and triangulate a quad per segment between the outer and inner arcs', () => {
    // mock
    const outerPoints = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const innerPoints = [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
    ];
    const rimPoints = [{ x: 5, y: 5 }];
    getEllipseArcPointsMock.mockReturnValueOnce(outerPoints).mockReturnValueOnce(innerPoints).mockReturnValueOnce(rimPoints);
    getQuadVerticesMock.mockReturnValue([1, 2, 3, 4, 5, 6, 7, 8]);

    // before
    const result = getRingGeometry(RECT, 5, 0, 90, CENTER, false, false, 0);

    // result
    expect(getQuadVerticesMock).toHaveBeenCalledWith(0, 0, 10, 0, 8, 2, 2, 2);
    expect(result).toEqual({ rimPoints, vertices: [1, 2, 3, 4, 5, 6, 7, 8] });
  });

  it('should not triangulate past the last outer point (an open ring, not a closed one)', () => {
    // mock
    const outerPoints = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    const innerPoints = [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
    ];
    getEllipseArcPointsMock.mockReturnValueOnce(outerPoints).mockReturnValueOnce(innerPoints).mockReturnValueOnce([]);
    getQuadVerticesMock.mockReturnValue([]);

    // before
    getRingGeometry(RECT, 5, 0, 90, CENTER, false, false, 0);

    // result
    expect(getQuadVerticesMock).toHaveBeenCalledTimes(2);
  });

  it('should leave the rect unchanged when halfWidth is zero', () => {
    // before
    getRingGeometry(RECT, 0, 0, 90, CENTER, false, false, 0);

    // result
    expect(getEllipseArcPointsMock).toHaveBeenNthCalledWith(1, RECT, 0, 90, expect.any(Number), 1);
    expect(getEllipseArcPointsMock).toHaveBeenNthCalledWith(2, RECT, 0, 90, expect.any(Number), 1);
  });
});
