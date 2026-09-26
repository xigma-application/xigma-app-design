// types
import { TDrawSceneContext } from '../../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeRotateSnapshotFace } from '../drawVectorNodeRotateSnapshotFace';

const drawVectorFillGroupMock = vi.fn();

vi.mock('../../drawVectorFillGroup', () => ({
  drawVectorFillGroup: (...args: unknown[]): void => drawVectorFillGroupMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const gradientProgram = {} as WebGLProgram;
const patternTileProgram = {} as WebGLProgram;
const imageProgram = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageTextureCache = new Map();
const imagePaintTextureSizeCache = new Map();

const context: TDrawSceneContext = {
  buffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl,
  imageContext: {
    cache: imageTextureCache,
    gradientProgram,
    imagePaintTextureSizeCache,
    isAlphaWriteEnabled: false,
    patternTileProgram,
    program: imageProgram,
  } as TDrawSceneContext['imageContext'],
  program,
  viewport: IDENTITY_VIEWPORT,
};

const snapshot: TVectorNodeRotateSnapshot = {
  deltaDegrees: 90,
  facesByPaint: [],
  pivot: { x: 0, y: 0 },
  strokeVertices: [],
  strokes: [{ color: '#0d99ff', opacity: 100, type: 'solid' }],
};

describe('drawVectorNodeRotateSnapshotFace', () => {
  beforeEach(() => {
    drawVectorFillGroupMock.mockClear();
  });

  it('should rotate the face points around the pivot and draw with the unrotated local bounds and unmodified paint', () => {
    // mock — a 10x10 square face, rotated 90° around the origin: (10,0) -> (0,10), (10,10) -> (-10,10), (0,10) -> (-10,0)
    const paint = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const points = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    ];

    // before
    drawVectorNodeRotateSnapshotFace(context, snapshot, { paint, points });

    // result
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(context, null, null, expect.anything(), paint, [], {
      center: { x: -5, y: 5 },
      degrees: 90,
      localBounds: { height: 10, width: 10, x: -10, y: 0 },
    });

    const [rotatedFaces] = drawVectorFillGroupMock.mock.calls[0][3] as { x: number; y: number }[][];
    const expected = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: -10, y: 10 },
      { x: -10, y: 0 },
    ];

    rotatedFaces.forEach((point, index) => {
      expect(point.x).toBeCloseTo(expected[index].x);
      expect(point.y).toBeCloseTo(expected[index].y);
    });
  });

  it('should rotate an image fill’s stored crop rect along with the face', () => {
    // mock
    const paint = [
      {
        crop: { height: 4, rotation: 0, width: 4, x: 2, y: 2 },
        opacity: 100,
        ref: 'asset-1',
        rotation: 0,
        scaleMode: 'fill' as const,
        type: 'image' as const,
      },
    ];
    const points = [[{ x: 0, y: 0 }]];

    // before
    drawVectorNodeRotateSnapshotFace(context, snapshot, { paint, points });

    // result — crop.rotation absorbs the applied deltaDegrees
    const [, , , , rotatedPaint] = drawVectorFillGroupMock.mock.calls[0] as unknown[];

    expect((rotatedPaint as typeof paint)[0].crop).toMatchObject({ rotation: 90 });
  });

  it('should lay an image or gradient over the whole vector bounds, not only this group of areas', () => {
    // mock
    const paint = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const points = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];
    const fillBounds = { height: 100, width: 200, x: -50, y: -20 };

    // before
    drawVectorNodeRotateSnapshotFace(context, { ...snapshot, fillBounds }, { paint, points });

    // result
    expect(drawVectorFillGroupMock.mock.calls[0][6]).toMatchObject({ localBounds: { height: 100, width: 200 } });
  });

  it('should add the turn to the fill rotation a rotated vector already has', () => {
    // mock
    const paint = [{ opacity: 100, ref: 'photo.png', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const }];
    const fillRotation = { center: { x: 5, y: 5 }, degrees: 30, localBounds: { height: 10, width: 10, x: 0, y: 0 } };

    // before
    drawVectorNodeRotateSnapshotFace(
      context,
      { ...snapshot, deltaDegrees: 60, fillRotation, pivot: { x: 5, y: 5 } },
      { paint, points: [[{ x: 0, y: 0 }]] },
    );

    // result
    expect(drawVectorFillGroupMock.mock.calls[0][6]).toEqual({ ...fillRotation, degrees: 90 });
  });
});
