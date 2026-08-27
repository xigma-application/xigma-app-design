// types
import { ToolName } from 'types/design/enums';

// utils
import { drawVectorEraseBrush } from '../drawVectorEraseBrush';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({
  drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorEraseBrush', () => {
  beforeEach(() => drawEllipseMock.mockClear());

  it('should draw nothing when the Erase tool is not active', () => {
    // before
    drawVectorEraseBrush(gl, program, buffer, { x: 10, y: 10 }, 10, ToolName.default, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when there is no brush centre to draw at', () => {
    // before
    drawVectorEraseBrush(gl, program, buffer, null, 10, ToolName.erase, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should stroke a circle of the eraser diameter centred on the brush point', () => {
    // before
    drawVectorEraseBrush(gl, program, buffer, { x: 40, y: 60 }, 20, ToolName.erase, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result — radius = 20 / 2 / zoom(2) = 5, so a 10×10 box at (35, 55)
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.objectContaining({ height: 10, width: 10, x: 35, y: 55 }),
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
      0,
    );
  });
});
