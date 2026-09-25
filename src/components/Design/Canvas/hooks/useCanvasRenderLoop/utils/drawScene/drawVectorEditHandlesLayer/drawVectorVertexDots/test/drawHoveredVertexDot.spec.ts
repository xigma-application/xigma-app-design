// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE } from 'constant/canvas';

// utils
import { drawHoveredVertexDot } from '../drawHoveredVertexDot';

const drawVertexDotMock = vi.fn();

vi.mock('../drawVertexDot', () => ({ drawVertexDot: (...args: unknown[]): unknown => drawVertexDotMock(...args) }));

describe('drawHoveredVertexDot', () => {
  it('should draw the hovered vertex as an enlarged dot', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const viewport = { x: 0, y: 0, zoom: 1 };

    // before
    drawHoveredVertexDot(gl, program, buffer, { id: 'v', x: 3, y: 4 }, 6, 200, 100, viewport);

    // result
    expect(drawVertexDotMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      3,
      4,
      6 * VECTOR_VERTEX_HOVER_SCALE,
      VECTOR_VERTEX_FILL,
      200,
      100,
      viewport,
    );
  });
});
