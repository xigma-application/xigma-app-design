// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE } from 'constant/canvas';

// utils
import { drawNewVertexDot } from '../drawNewVertexDot';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): unknown => drawEllipseMock(...args) }));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const viewport = { x: 0, y: 0, zoom: 1 };

describe('drawNewVertexDot', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw the would-be vertex as a ringed dot centered on it', () => {
    // before
    drawNewVertexDot(gl, program, buffer, { id: 'v', x: 10, y: 20 }, false, 6, 200, 100, viewport);

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: VECTOR_VERTEX_FILL, height: 6, stroke: VECTOR_CUT_CROSSING_FILL, width: 6, x: 7, y: 17 },
      200,
      100,
      viewport,
      0,
    );
  });

  it('should enlarge the dot while hovered', () => {
    // before
    drawNewVertexDot(gl, program, buffer, { id: 'v', x: 10, y: 20 }, true, 6, 200, 100, viewport);

    // result
    expect(drawEllipseMock.mock.calls[0][3]).toMatchObject({ height: 6 * VECTOR_VERTEX_HOVER_SCALE, width: 6 * VECTOR_VERTEX_HOVER_SCALE });
  });
});
