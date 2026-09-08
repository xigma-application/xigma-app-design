// others
import { AUTO_LAYOUT_PADDING_HANDLE_FILL } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawAutoLayoutPaddingHatchFill } from '../drawAutoLayoutPaddingHatchFill';

const drawVectorHatchFillMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorHatchFill', () => ({
  drawVectorHatchFill: (...args: unknown[]): void => drawVectorHatchFillMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 200,
  canvasWidth: 200,
  gl: {} as WebGL2RenderingContext,
  imageContext: { isAlphaWriteEnabled: true } as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

const frameCenter = { x: 0, y: 0 };

describe('drawAutoLayoutPaddingHatchFill', () => {
  beforeEach(() => {
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw one hatched face for the band, un-rotated', () => {
    // mock
    const band = { height: 200, width: 20, x: 0, y: 0 };

    // before
    drawAutoLayoutPaddingHatchFill(context, band, frameCenter, 0);

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      [
        [
          { x: 0, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 200 },
          { x: 0, y: 200 },
        ],
      ],
      AUTO_LAYOUT_PADDING_HANDLE_FILL,
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
      true,
    );
  });

  it('should rotate the face around the given frame centre', () => {
    // mock — 90deg rotation moves the (20,0) corner off its un-rotated position
    const band = { height: 200, width: 20, x: 0, y: 0 };

    // before
    drawAutoLayoutPaddingHatchFill(context, band, { x: 0, y: 0 }, 90);

    // result
    const [, , , faces] = drawVectorHatchFillMock.mock.calls[0];

    expect(faces[0][1]).not.toEqual({ x: 20, y: 0 });
  });

  it('should draw nothing when the band has zero width', () => {
    // before
    drawAutoLayoutPaddingHatchFill(context, { height: 200, width: 0, x: 0, y: 0 }, frameCenter, 0);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the band has zero height', () => {
    // before
    drawAutoLayoutPaddingHatchFill(context, { height: 0, width: 20, x: 0, y: 0 }, frameCenter, 0);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });
});
