// utils
import { drawDragArmableVertexCross } from '../drawDragArmableVertexCross';

const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawDragArmableVertexCross', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw a small orange cross, sized as a fraction of the given vertex dot size, centered on the point', () => {
    // before — vertexSize 5 -> radius 5*0.25=1.25, stroke 5*0.12=0.6, comfortably inside a 5-unit dot
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    drawDragArmableVertexCross(gl, program, buffer, { x: 10, y: 10 }, 5, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 8.75, x2: 11.25, y1: 8.75, y2: 11.25 },
      '#cd4422',
      0.6,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 8.75, x2: 11.25, y1: 11.25, y2: 8.75 },
      '#cd4422',
      0.6,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
  });

  it('should shrink the cross proportionally with a smaller vertex dot size', () => {
    // before — vertexSize 2.5 (e.g. the dot at 2x zoom) -> radius 0.625, stroke 0.3
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    drawDragArmableVertexCross(gl, program, buffer, { x: 0, y: 0 }, 2.5, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock.mock.calls[0][3]).toEqual({ x1: -0.625, x2: 0.625, y1: -0.625, y2: 0.625 });
    expect(drawLineMock.mock.calls[0][4]).toBe('#cd4422');
    expect(drawLineMock.mock.calls[0][5]).toBeCloseTo(0.3);
  });
});
