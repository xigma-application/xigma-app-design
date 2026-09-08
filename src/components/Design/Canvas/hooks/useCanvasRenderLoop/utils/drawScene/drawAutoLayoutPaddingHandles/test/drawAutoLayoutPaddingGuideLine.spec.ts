// others
import { AUTO_LAYOUT_PADDING_GUIDE_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawAutoLayoutPaddingGuideLine } from '../drawAutoLayoutPaddingGuideLine';

const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 200,
  canvasWidth: 200,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

const frame = { height: 200, width: 300, x: 0, y: 0 };
const frameCenter = { x: 150, y: 100 };

describe('drawAutoLayoutPaddingGuideLine', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw a solid vertical line at the left band’s inner edge, spanning the frame height', () => {
    // mock
    const band = { height: 200, width: 20, x: 0, y: 0 };

    // before
    drawAutoLayoutPaddingGuideLine(context, frame, band, 'left', frameCenter, 0);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      { x1: 20, x2: 20, y1: 0, y2: 200 },
      AUTO_LAYOUT_PADDING_GUIDE_STROKE,
      1,
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
    );
  });

  it('should draw a solid vertical line at the right band’s inner edge', () => {
    // mock
    const band = { height: 200, width: 20, x: 280, y: 0 };

    // before
    drawAutoLayoutPaddingGuideLine(context, frame, band, 'right', frameCenter, 0);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      { x1: 280, x2: 280, y1: 0, y2: 200 },
      AUTO_LAYOUT_PADDING_GUIDE_STROKE,
      1,
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
    );
  });

  it('should draw a solid horizontal line at the top band’s inner edge, spanning the frame width', () => {
    // mock
    const band = { height: 20, width: 300, x: 0, y: 0 };

    // before
    drawAutoLayoutPaddingGuideLine(context, frame, band, 'top', frameCenter, 0);

    // result
    const [, , , line] = drawLineMock.mock.calls[0];

    expect(line).toEqual({ x1: 0, x2: 300, y1: 20, y2: 20 });
  });

  it('should draw a solid horizontal line at the bottom band’s inner edge', () => {
    // mock
    const band = { height: 20, width: 300, x: 0, y: 180 };

    // before
    drawAutoLayoutPaddingGuideLine(context, frame, band, 'bottom', frameCenter, 0);

    // result
    const [, , , line] = drawLineMock.mock.calls[0];

    expect(line).toEqual({ x1: 0, x2: 300, y1: 180, y2: 180 });
  });

  it('should rotate the line around the given frame centre', () => {
    // mock — 90deg rotation moves the un-rotated endpoints
    const band = { height: 200, width: 20, x: 0, y: 0 };

    // before
    drawAutoLayoutPaddingGuideLine(context, frame, band, 'left', frameCenter, 90);

    // result
    const [, , , line] = drawLineMock.mock.calls[0];

    expect(line).not.toEqual({ x1: 20, x2: 20, y1: 0, y2: 200 });
  });

  it('should scale the stroke width down as zoom increases', () => {
    // mock
    const zoomedContext = { ...context, viewport: { x: 0, y: 0, zoom: 4 } };
    const band = { height: 200, width: 20, x: 0, y: 0 };

    // before
    drawAutoLayoutPaddingGuideLine(zoomedContext, frame, band, 'left', frameCenter, 0);

    // result
    const [, , , , , strokeWidth] = drawLineMock.mock.calls[0];

    expect(strokeWidth).toBe(0.25);
  });
});
