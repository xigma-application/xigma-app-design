// utils
import { drawVectorShapeBuilderPath } from '../drawVectorShapeBuilderPath';

const drawDashedPolylineOutlineMock = vi.fn();

vi.mock('utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline', () => ({
  drawDashedPolylineOutline: (...args: unknown[]): void => drawDashedPolylineOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const call = (path: Parameters<typeof drawVectorShapeBuilderPath>[3], isBoxMode: boolean): void => {
  drawVectorShapeBuilderPath(
    {} as WebGL2RenderingContext,
    {} as WebGLProgram,
    {} as WebGLBuffer,
    path,
    isBoxMode,
    200,
    150,
    IDENTITY_VIEWPORT,
  );
};

describe('drawVectorShapeBuilderPath', () => {
  beforeEach(() => {
    drawDashedPolylineOutlineMock.mockClear();
  });

  it('should draw nothing when there is no path', () => {
    // before
    call(null, false);

    // result
    expect(drawDashedPolylineOutlineMock).not.toHaveBeenCalled();
  });

  it('should stroke the raw path as an OPEN dashed black line (no fill, no closing segment back to the start), in freeform mode', () => {
    // mock
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];

    // before
    call(path, false);

    // result — isClosed is false: a freeform path reads like a route from A to Z, not a lasso loop
    expect(drawDashedPolylineOutlineMock).toHaveBeenCalledWith({}, {}, {}, path, false, '#000000', 200, 150, IDENTITY_VIEWPORT, 6, 4.5);
  });

  it('should stroke the swept box (from the first point to the last) as a CLOSED outline, not the raw path, in box mode', () => {
    // mock
    const path = [
      { x: 0, y: 0 },
      { x: 40, y: 20 },
      { x: 100, y: 100 },
    ];

    // before
    call(path, true);

    // result — corners of the (0,0)-(100,100) box, per getRectCorners; isClosed is true since a box
    // is a real closed rectangle
    expect(drawDashedPolylineOutlineMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      true,
      '#000000',
      200,
      150,
      IDENTITY_VIEWPORT,
      6,
      4.5,
    );
  });
});
