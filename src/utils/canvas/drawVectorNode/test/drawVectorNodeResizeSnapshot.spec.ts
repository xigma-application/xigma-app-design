// types
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeResizeSnapshot } from '../drawVectorNodeResizeSnapshot';

const drawVectorFillMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();
const getThickVectorPathVerticesMock = vi.fn();

vi.mock('../drawVectorFill', () => ({ drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args) }));
vi.mock('../drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));
vi.mock('../../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices', () => ({
  getThickVectorPathVertices: (...args: unknown[]): unknown => getThickVectorPathVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorNodeResizeSnapshot', () => {
  beforeEach(() => {
    drawVectorFillMock.mockClear();
    drawVectorThickStrokeVerticesMock.mockClear();
    getThickVectorPathVerticesMock.mockReset();
    getThickVectorPathVerticesMock.mockReturnValue([]);
  });

  it('should scale each color group’s face points around the anchor by the current scale, then draw one fill call per color', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByColor: [
        {
          color: '#ff0000',
          points: [
            [
              { x: 10, y: 20 },
              { x: 30, y: 40 },
            ],
          ],
        },
        { color: '#00ff00', points: [[{ x: 5, y: 5 }]] },
      ],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 0.5,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeWidth: 4,
    };

    // before
    drawVectorNodeResizeSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      null,
      null,
      [
        [
          { x: 20, y: 10 },
          { x: 60, y: 20 },
        ],
      ],
      '#ff0000',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      null,
      null,
      [[{ x: 10, y: 2.5 }]],
      '#00ff00',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should leave a point unscaled on an axis whose anchor is null (that axis isn’t being resized)', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: null,
      anchorY: 0,
      facesByColor: [{ color: '#ff0000', points: [[{ x: 10, y: 20 }]] }],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 3,
      scaleY: 2,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeWidth: 4,
    };

    // before
    drawVectorNodeResizeSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result — x stays 10 (untouched, no anchor), y scales to 40 around anchor 0
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      [[{ x: 10, y: 40 }]],
      '#ff0000',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should scale every flattened segment’s points and re-derive the thick stroke from the scaled centerline at the node’s own stroke width', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByColor: [],
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
      strokeColor: '#0d99ff',
      strokeWidth: 4,
    };

    getThickVectorPathVerticesMock.mockReturnValue([1, 2, 3, 4]);

    // before
    drawVectorNodeResizeSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

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
    );
  });

  it('should scale, re-center on the scaled bounds, then rotate around the solved pivot for a rotated snapshot', () => {
    // mock — a point at the anchor-scaled origin (0,0), whose scaled bounds are centered on (10,10);
    // rotating 90deg around a pivot at (100,50) should land it at (100+10, 50-10) = (110, 40)
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByColor: [{ color: '#ff0000', points: [[{ x: 0, y: 0 }]] }],
      flattenedSegments: [],
      pivot: { x: 100, y: 50 },
      rotation: 90,
      scaleX: 1,
      scaleY: 1,
      scaledCenter: { x: 10, y: 10 },
      strokeColor: '#0d99ff',
      strokeWidth: 4,
    };

    // before
    drawVectorNodeResizeSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      [[{ x: 110, y: 40 }]],
      '#ff0000',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
