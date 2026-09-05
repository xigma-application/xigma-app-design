// others
import { FRAME_DROP_TARGET_STROKE } from 'constant/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawAutoLayoutDropIndicator } from '../drawAutoLayoutDropIndicator';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawAutoLayoutDropIndicator', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a filled bar at the indicator rect referenced by the drop-target ref', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutDropTargetRef: {
          current: { frameId: 'f1', index: 0, indicator: { height: 2, width: 30, x: 10, y: 20 }, siblingPositions: {} },
        },
      },
    });

    // before
    drawAutoLayoutDropIndicator(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refs,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: FRAME_DROP_TARGET_STROKE, height: 2, width: 30, x: 10, y: 20 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw nothing when the drop-target ref is empty', () => {
    // before
    drawAutoLayoutDropIndicator(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });
});
