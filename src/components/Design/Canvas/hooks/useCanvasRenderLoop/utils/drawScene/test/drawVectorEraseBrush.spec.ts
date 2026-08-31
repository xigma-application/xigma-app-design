// types
import { ToolName } from 'types/design/enums';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorEraseBrush } from '../drawVectorEraseBrush';

const refsFor = (brushCenter: TPoint | null, diameterPx: number): TCanvasRefs =>
  createCanvasRefs({
    vectorErase: { eraseBrushCenterRef: { current: brushCenter }, eraserDiameterRef: { current: diameterPx } },
  });

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
    drawVectorEraseBrush(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refsFor({ x: 10, y: 10 }, 10),
      ToolName.default,
      200,
      150,
    );

    // result
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when there is no brush centre to draw at', () => {
    // before
    drawVectorEraseBrush(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      refsFor(null, 10),
      ToolName.erase,
      200,
      150,
    );

    // result
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should stroke a circle of the eraser diameter centred on the brush point', () => {
    // before
    drawVectorEraseBrush(
      { buffer, gl, imageContext: {} as never, program, viewport: { x: 0, y: 0, zoom: 2 } },
      refsFor({ x: 40, y: 60 }, 20),
      ToolName.erase,
      200,
      150,
    );

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
