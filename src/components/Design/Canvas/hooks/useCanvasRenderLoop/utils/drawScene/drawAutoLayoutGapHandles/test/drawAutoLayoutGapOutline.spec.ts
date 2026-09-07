// others
import { SMART_SELECTION_SWAP_HANDLE_FILL } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawAutoLayoutGapOutline } from '../drawAutoLayoutGapOutline';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
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

const frameCenter = { x: 100, y: 50 };

describe('drawAutoLayoutGapOutline', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a pink stroke rect, rotated around the frame centre, for every fill rect', () => {
    // mock
    const fillRects = [
      { height: 50, width: 20, x: 50, y: 0 },
      { height: 20, width: 120, x: 0, y: 50 },
    ];

    // before
    drawAutoLayoutGapOutline(context, fillRects, frameCenter, 90);

    // result
    expect(drawRectMock).toHaveBeenCalledTimes(2);
    expect(drawRectMock).toHaveBeenNthCalledWith(
      1,
      context.gl,
      context.program,
      context.buffer,
      { ...fillRects[0], stroke: SMART_SELECTION_SWAP_HANDLE_FILL },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
      90,
      frameCenter,
    );
  });

  it('should draw nothing when there are no fill rects', () => {
    // before
    drawAutoLayoutGapOutline(context, [], frameCenter, 0);

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });
});
