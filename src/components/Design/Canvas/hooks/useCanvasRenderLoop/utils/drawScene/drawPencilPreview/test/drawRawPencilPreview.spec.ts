// others
import { PENCIL_STROKE, PENCIL_STROKE_WIDTH } from '../../../../../../constants';

// utils
import { drawRawPencilPreview } from '../drawRawPencilPreview';

const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): unknown => drawVectorStrokeMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const viewport = { x: 0, y: 0, zoom: 1 };

describe('drawRawPencilPreview', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
  });

  it('should stroke the raw pencil points as one polyline', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ];

    // before
    drawRawPencilPreview(gl, program, buffer, points, 200, 100, viewport);

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [{ endId: 'pencil-raw-preview-end', points, segmentId: 'pencil-raw-preview', startId: 'pencil-raw-preview-start' }],
      PENCIL_STROKE,
      PENCIL_STROKE_WIDTH,
      200,
      100,
      viewport,
    );
  });

  it('should draw nothing for fewer than two points', () => {
    // before
    drawRawPencilPreview(gl, program, buffer, null, 200, 100, viewport);
    drawRawPencilPreview(gl, program, buffer, [{ x: 0, y: 0 }], 200, 100, viewport);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
