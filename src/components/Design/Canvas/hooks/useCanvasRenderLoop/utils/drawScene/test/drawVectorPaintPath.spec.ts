// utils
import { drawVectorPaintPath } from '../drawVectorPaintPath';

const drawDashedPolylineOutlineMock = vi.fn();

vi.mock('utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline', () => ({
  drawDashedPolylineOutline: (...args: unknown[]): void => drawDashedPolylineOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const call = (path: Parameters<typeof drawVectorPaintPath>[3]): void => {
  drawVectorPaintPath({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, path, 200, 150, IDENTITY_VIEWPORT);
};

describe('drawVectorPaintPath', () => {
  beforeEach(() => {
    drawDashedPolylineOutlineMock.mockClear();
  });

  it('should draw nothing when there is no in-progress paint stroke', () => {
    // before
    call(null);

    // result
    expect(drawDashedPolylineOutlineMock).not.toHaveBeenCalled();
  });

  it('should stroke the raw stroke path as an OPEN dashed black line, matching the Shape Builder trail', () => {
    // mock
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];

    // before
    call(path);

    // result — isClosed is false: a paint stroke reads like a route from A to Z, not a lasso loop
    expect(drawDashedPolylineOutlineMock).toHaveBeenCalledWith({}, {}, {}, path, false, '#000000', 200, 150, IDENTITY_VIEWPORT, 6, 4.5);
  });
});
