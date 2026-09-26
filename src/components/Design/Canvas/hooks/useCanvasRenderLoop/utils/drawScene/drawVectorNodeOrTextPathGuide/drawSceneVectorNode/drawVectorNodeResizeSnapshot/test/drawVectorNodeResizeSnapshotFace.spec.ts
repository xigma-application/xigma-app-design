// types
import { TDrawSceneContext } from '../../../../types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeResizeSnapshotFace } from '../drawVectorNodeResizeSnapshotFace';

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

const snapshot: TVectorNodeResizeSnapshot = {
  anchorX: 0,
  anchorY: 0,
  facesByPaint: [],
  flattenedSegments: [],
  pivot: { x: 0, y: 0 },
  rotation: 0,
  scaleX: 2,
  scaleY: 1,
  scaledCenter: { x: 0, y: 0 },
  strokeWidth: 4,
  strokes: [{ color: '#0d99ff', opacity: 100, type: 'solid' }],
};

describe('drawVectorNodeResizeSnapshotFace', () => {
  beforeEach(() => {
    drawVectorFillPaintsMock.mockClear();
  });

  it('should scale the face points and the local bounds, then draw with the unmodified paint and new center', () => {
    // mock — a 10x10 square face, scaled 2x horizontally only
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
    drawVectorNodeResizeSnapshotFace(context, snapshot, { paint, points });

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
      [
        [
          { x: 0, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 10 },
          { x: 0, y: 10 },
        ],
      ],
      paint,
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      undefined,
      { center: { x: 10, y: 5 }, degrees: 0, localBounds: { height: 10, width: 20, x: 0, y: 0 } },
    );
  });

  it('should scale an image fill’s stored crop rect along with the face', () => {
    // mock — same 10x10 square, but the paint carries a crop that must scale with it
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
    const points = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    ];

    // before
    drawVectorNodeResizeSnapshotFace(context, snapshot, { paint, points });

    // result — crop width scales by scaleX (2x), height by scaleY (1x)
    const [, , , , , , , , , , , scaledPaint] = drawVectorFillPaintsMock.mock.calls[0] as unknown[];

    expect((scaledPaint as typeof paint)[0].crop).toMatchObject({ height: 4, width: 8 });
  });
});
