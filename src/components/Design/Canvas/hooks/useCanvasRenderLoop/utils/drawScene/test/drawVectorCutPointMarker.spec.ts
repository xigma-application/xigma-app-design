// utils
import { drawVectorCutPointMarker } from '../drawVectorCutPointMarker';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({
  drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorCutPointMarker', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw a white-centered, pink-bordered dot at VECTOR_VERTEX_SIZE, same size as a plain unselected vertex dot', () => {
    // before
    drawVectorCutPointMarker(gl, program, buffer, { x: 25, y: 50 }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 5, stroke: '#ff2fc2', width: 5, x: 22.5, y: 47.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should scale the marker size down by the current zoom level', () => {
    // before
    drawVectorCutPointMarker(gl, program, buffer, { x: 25, y: 50 }, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 2.5, stroke: '#ff2fc2', width: 2.5, x: 23.75, y: 48.75 },
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
      0,
    );
  });
});
