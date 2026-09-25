// others
import { PENCIL_NAME, PENCIL_STROKE, PENCIL_STROKE_WIDTH, PENCIL_TANGENT_TENSION } from '../../../../../../constants';

// types
import { NodeType } from 'types/design/enums';

// utils
import { drawSmoothedPencilPreview } from '../drawSmoothedPencilPreview';

const buildMock = vi.fn(() => ({ segments: 'segments', vertexHandleModes: 'modes', vertices: 'vertices' }));
const drawVectorStrokeMock = vi.fn();
const drawRoundedCapsMock = vi.fn();

vi.mock('../../../../../useDrawPencilTool/utils/handlePointerUp/buildVectorNetworkFromPoints', () => ({
  buildVectorNetworkFromPoints: (...args: unknown[]): unknown => buildMock(...(args as [])),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): unknown => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorRoundedCaps', () => ({
  drawVectorRoundedCaps: (...args: unknown[]): unknown => drawRoundedCapsMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/flattenVectorSegments', () => ({ flattenVectorSegments: (): string => 'flattened' }));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const viewport = { x: 0, y: 0, zoom: 1 };

describe('drawSmoothedPencilPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should stroke the smoothed pencil path with rounded caps', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ];

    // before
    drawSmoothedPencilPreview(gl, program, buffer, points, 200, 100, viewport);

    // result
    expect(buildMock).toHaveBeenCalledWith(points, PENCIL_TANGENT_TENSION);
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      'flattened',
      PENCIL_STROKE,
      PENCIL_STROKE_WIDTH,
      200,
      100,
      viewport,
    );
    expect(drawRoundedCapsMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.objectContaining({ capStyle: 'round', name: PENCIL_NAME, segments: 'segments', type: NodeType.vector, vertices: 'vertices' }),
      200,
      100,
      viewport,
    );
  });

  it('should draw nothing for fewer than two points', () => {
    // before
    drawSmoothedPencilPreview(gl, program, buffer, null, 200, 100, viewport);
    drawSmoothedPencilPreview(gl, program, buffer, [{ x: 0, y: 0 }], 200, 100, viewport);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
