// others
import { DISTANCE_GUIDE_STROKE, VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// utils
import { drawDistanceGuideTargetDot } from '../drawDistanceGuideTargetDot';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawDistanceGuideTargetDot', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw a white dot with an orange border, centered on the target point, at the same size as a hovered vertex', () => {
    // before
    drawDistanceGuideTargetDot(gl, program, buffer, { x: 30, y: 40 }, 200, 150, { x: 0, y: 0, zoom: 1 });

    // result
    const size = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE;

    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: VECTOR_VERTEX_FILL, height: size, stroke: DISTANCE_GUIDE_STROKE, width: size, x: 30 - size / 2, y: 40 - size / 2 },
      200,
      150,
      { x: 0, y: 0, zoom: 1 },
      0,
    );
  });

  it('should scale the dot down as the viewport zooms in, keeping it a constant screen size', () => {
    // before
    drawDistanceGuideTargetDot(gl, program, buffer, { x: 30, y: 40 }, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    const size = (VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE) / 2;

    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: VECTOR_VERTEX_FILL, height: size, stroke: DISTANCE_GUIDE_STROKE, width: size, x: 30 - size / 2, y: 40 - size / 2 },
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
      0,
    );
  });
});
