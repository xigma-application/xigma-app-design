// types
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorShapeBuilderPath } from '../drawVectorShapeBuilderPath';

const drawDashedPolylineOutlineMock = vi.fn();

vi.mock('utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline', () => ({
  drawDashedPolylineOutline: (...args: unknown[]): void => drawDashedPolylineOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const call = (path: TPoint[] | null, isBoxMode: boolean): void => {
  drawVectorShapeBuilderPath(
    {
      buffer: {} as WebGLBuffer,
      canvasHeight: 150,
      canvasWidth: 200,
      gl: {} as WebGL2RenderingContext,
      imageContext: {} as never,
      program: {} as WebGLProgram,
      viewport: IDENTITY_VIEWPORT,
    },
    createCanvasRefs({
      shapeBuilder: { isVectorShapeBuilderBoxModeRef: { current: isBoxMode }, vectorShapeBuilderPathRef: { current: path } },
    }),
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
