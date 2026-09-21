// types
import { TDrawSceneContext } from '../../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeRotateSnapshotFace } from '../drawVectorNodeRotateSnapshotFace';

const drawVectorFillPaintsMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorFillPaints', () => ({
  drawVectorFillPaints: (...args: unknown[]): void => drawVectorFillPaintsMock(...args),
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
  strokeColor: '#0d99ff',
  strokeVertices: [],
};

describe('drawVectorNodeRotateSnapshotFace', () => {
  beforeEach(() => {
    drawVectorFillPaintsMock.mockClear();
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
    expect(drawVectorFillPaintsMock).toHaveBeenCalledWith(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imagePaintTextureSizeCache,
      buffer,
      null,
      null,
      expect.anything(),
      paint,
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      undefined,
      { center: { x: 0, y: 0 }, degrees: 90, localBounds: { height: 10, width: 10, x: 0, y: 0 } },
    );

    const [rotatedFaces] = drawVectorFillPaintsMock.mock.calls[0][10] as { x: number; y: number }[][];
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
    const [, , , , , , , , , , , rotatedPaint] = drawVectorFillPaintsMock.mock.calls[0] as unknown[];

    expect((rotatedPaint as typeof paint)[0].crop).toMatchObject({ rotation: 90 });
  });
});
