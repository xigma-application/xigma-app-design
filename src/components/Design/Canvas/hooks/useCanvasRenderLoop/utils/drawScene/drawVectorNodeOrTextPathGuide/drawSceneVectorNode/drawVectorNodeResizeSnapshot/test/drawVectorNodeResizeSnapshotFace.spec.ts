// types
import { TDrawSceneContext } from '../../../../types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeResizeSnapshotFace } from '../drawVectorNodeResizeSnapshotFace';

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
    drawVectorFillGroupMock.mockClear();
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
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
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
    const [, , , , scaledPaint] = drawVectorFillGroupMock.mock.calls[0] as unknown[];

    expect((scaledPaint as typeof paint)[0].crop).toMatchObject({ height: 4, width: 8 });
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
    drawVectorNodeResizeSnapshotFace(context, { ...snapshot, fillBounds }, { paint, points });

    // result
    expect(drawVectorFillGroupMock.mock.calls[0][6]).toMatchObject({ localBounds: { height: 100, width: 400 } });
  });

  it('should turn the fill frame of a vector whose rotation was baked into its points with the resized outline', () => {
    // mock — a square outline whose fill keeps a 90deg turn, stretched 2x across
    const paint = [{ opacity: 100, ref: 'photo.png', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const }];
    const fillFrame = {
      degrees: 90,
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    };

    // before
    drawVectorNodeResizeSnapshotFace(context, { ...snapshot, fillFrame }, { paint, points: [fillFrame.points] });

    // result — the frame now spans the stretched outline, measured along its own 90deg turn
    const frame = drawVectorFillGroupMock.mock.calls[0][6] as { degrees: number; localBounds: { height: number; width: number } };

    expect(frame.degrees).toBe(90);
    expect(frame.localBounds.width).toBeCloseTo(10);
    expect(frame.localBounds.height).toBeCloseTo(20);
  });
});
