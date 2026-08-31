// types
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorPaintPath } from '../drawVectorPaintPath';

const drawDashedPolylineOutlineMock = vi.fn();

vi.mock('utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline', () => ({
  drawDashedPolylineOutline: (...args: unknown[]): void => drawDashedPolylineOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const call = (path: TPoint[] | null): void => {
  drawVectorPaintPath(
    {
      buffer: {} as WebGLBuffer,
      gl: {} as WebGL2RenderingContext,
      imageContext: {} as never,
      program: {} as WebGLProgram,
      viewport: IDENTITY_VIEWPORT,
    },
    createCanvasRefs({ vectorPaint: { vectorPaintPathRef: { current: path } } }),
    200,
    150,
  );
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
