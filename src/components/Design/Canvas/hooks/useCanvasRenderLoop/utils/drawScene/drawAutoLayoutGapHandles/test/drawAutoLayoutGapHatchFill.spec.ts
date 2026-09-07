// others
import { SMART_SELECTION_SWAP_HANDLE_FILL } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawAutoLayoutGapHatchFill } from '../drawAutoLayoutGapHatchFill';

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

describe('drawAutoLayoutGapHatchFill', () => {
  beforeEach(() => {
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw one hatched face per fill rect, un-rotated', () => {
    // mock
    const fillRects = [{ height: 20, width: 20, x: 50, y: 0 }];

    // before
    drawAutoLayoutGapHatchFill(context, fillRects, frameCenter, 0);

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      [
        [
          { x: 50, y: 0 },
          { x: 70, y: 0 },
          { x: 70, y: 20 },
          { x: 50, y: 20 },
        ],
      ],
      SMART_SELECTION_SWAP_HANDLE_FILL,
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
      true,
    );
  });

  it('should rotate each face around the given frame centre', () => {
    // mock — 90deg rotation moves the (50,0) corner off its un-rotated position
    const fillRects = [{ height: 20, width: 20, x: 50, y: 0 }];

    // before
    drawAutoLayoutGapHatchFill(context, fillRects, { x: 0, y: 0 }, 90);

    // result
    const [, , , faces] = drawVectorHatchFillMock.mock.calls[0];

    expect(faces[0][0]).not.toEqual({ x: 50, y: 0 });
  });

  it('should draw nothing when there are no fill rects', () => {
    // before
    drawAutoLayoutGapHatchFill(context, [], frameCenter, 0);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });
});
