// types
import { TDrawSceneContext } from '../../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeRotateSnapshotStroke } from '../drawVectorNodeRotateSnapshotStroke';

const drawVectorThickStrokeVerticesMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context: TDrawSceneContext = {
  buffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl,
  imageContext: {} as TDrawSceneContext['imageContext'],
  program,
  viewport: IDENTITY_VIEWPORT,
};

describe('drawVectorNodeRotateSnapshotStroke', () => {
  beforeEach(() => {
    drawVectorThickStrokeVerticesMock.mockClear();
  });

  it('should rotate the flat stroke vertex list point-by-point around the pivot and draw the result', () => {
    // mock — a 90° turn around (0,0): (10,0) -> (0,10), (0,10) -> (-10,0)
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 90,
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [10, 0, 0, 10],
    };

    // before
    drawVectorNodeRotateSnapshotStroke(context, snapshot);

    // result
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledTimes(1);

    const rotatedVertices = drawVectorThickStrokeVerticesMock.mock.calls[0][4] as number[];

    expect(rotatedVertices[0]).toBeCloseTo(0);
    expect(rotatedVertices[1]).toBeCloseTo(10);
    expect(rotatedVertices[2]).toBeCloseTo(-10);
    expect(rotatedVertices[3]).toBeCloseTo(0);
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      expect.anything(),
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw an empty vertex list untouched when there is no stroke', () => {
    // mock
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 45,
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    drawVectorNodeRotateSnapshotStroke(context, snapshot);

    // result
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(gl, program, buffer, null, [], '#0d99ff', 200, 150, IDENTITY_VIEWPORT);
  });
});
