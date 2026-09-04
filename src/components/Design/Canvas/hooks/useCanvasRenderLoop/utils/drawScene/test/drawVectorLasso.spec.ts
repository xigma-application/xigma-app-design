// types
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorLasso } from '../drawVectorLasso';

const drawVectorFillMock = vi.fn();
const drawDashedPolylineOutlineMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorFill', () => ({
  drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args),
}));
vi.mock('utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline', () => ({
  drawDashedPolylineOutline: (...args: unknown[]): void => drawDashedPolylineOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const call = (path: TPoint[] | null): void => {
  drawVectorLasso(
    {
      buffer: {} as WebGLBuffer,
      canvasHeight: 150,
      canvasWidth: 200,
      gl: {} as WebGL2RenderingContext,
      imageContext: { isAlphaWriteEnabled: false } as never,
      program: {} as WebGLProgram,
      viewport: IDENTITY_VIEWPORT,
    },
    createCanvasRefs({ lassoMarquee: { vectorLassoPathRef: { current: path } } }),
  );
};

describe('drawVectorLasso', () => {
  beforeEach(() => {
    drawVectorFillMock.mockClear();
    drawDashedPolylineOutlineMock.mockClear();
  });

  it('should draw nothing when there is no path', () => {
    // before
    call(null);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawDashedPolylineOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the path has fewer than 2 points', () => {
    // before
    call([{ x: 0, y: 0 }]);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawDashedPolylineOutlineMock).not.toHaveBeenCalled();
  });

  it('should fill the closed path at the translucent marquee alpha and stroke it with a dashed outline', () => {
    // mock
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];

    // before
    call(path);

    // result — the fill wraps the raw path as a single face, same shape the dashed outline traces
    expect(drawVectorFillMock).toHaveBeenCalledWith({}, {}, {}, null, null, [path], '#337ae1', 200, 150, IDENTITY_VIEWPORT, false, 0.2);
    expect(drawDashedPolylineOutlineMock).toHaveBeenCalledWith({}, {}, {}, path, true, '#337ae1', 200, 150, IDENTITY_VIEWPORT, 6, 4.5);
  });
});
