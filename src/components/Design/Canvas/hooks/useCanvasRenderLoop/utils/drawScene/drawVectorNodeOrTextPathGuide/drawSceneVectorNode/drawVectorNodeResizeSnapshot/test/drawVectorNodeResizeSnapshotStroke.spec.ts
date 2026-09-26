// types
import { TDrawSceneContext } from '../../../../types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeResizeSnapshotStroke } from '../drawVectorNodeResizeSnapshotStroke';

const drawVectorThickStrokeVerticesMock = vi.fn();
const getThickVectorPathVerticesMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices', () => ({
  getThickVectorPathVertices: (...args: unknown[]): unknown => getThickVectorPathVerticesMock(...args),
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

describe('drawVectorNodeResizeSnapshotStroke', () => {
  beforeEach(() => {
    drawVectorThickStrokeVerticesMock.mockClear();
    getThickVectorPathVerticesMock.mockReset();
    getThickVectorPathVerticesMock.mockReturnValue([]);
  });

  it('should scale every flattened segment’s points and re-derive the thick stroke at half the node’s stroke width', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByPaint: [],
      flattenedSegments: [
        {
          endId: 'v2',
          points: [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
          ],
          segmentId: 's1',
          startId: 'v1',
        },
      ],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeWidth: 4,
      strokes: [{ color: '#0d99ff', opacity: 100, type: 'solid' }],
    };

    getThickVectorPathVerticesMock.mockReturnValue([1, 2, 3, 4]);

    // before
    drawVectorNodeResizeSnapshotStroke(context, snapshot);

    // result
    expect(getThickVectorPathVerticesMock).toHaveBeenCalledWith(
      [
        {
          endId: 'v2',
          points: [
            { x: 20, y: 0 },
            { x: 40, y: 0 },
          ],
          segmentId: 's1',
          startId: 'v1',
        },
      ],
      2,
    );
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      [1, 2, 3, 4],
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
      1,
    );
  });
});
