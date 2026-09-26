// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeDragSnapshot } from '../drawVectorNodeDragSnapshot';

const drawVectorFillPaintsMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();

const drawVectorFillGroupMock = vi.fn();

vi.mock('../drawVectorFillGroup', () => ({
  drawVectorFillGroup: (...args: unknown[]): void => drawVectorFillGroupMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorFillPaints', () => ({
  drawVectorFillPaints: (...args: unknown[]): void => drawVectorFillPaintsMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createGlMock = (): WebGL2RenderingContext =>
  ({
    getUniformLocation: vi.fn(() => ({})),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const DRAG_GRADIENT_PROGRAM = {} as WebGLProgram;
const PATTERN_TILE_PROGRAM = {} as WebGLProgram;
const IMAGE_PROGRAM = {} as WebGLProgram;
const IMAGE_TEXTURE_CACHE = new Map<string, WebGLTexture>();
const IMAGE_PAINT_TEXTURE_SIZE_CACHE = new Map<string, { height: number; width: number }>();

const buildContext = (
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer,
  dragSnapshotProgram: WebGLProgram,
  dragSnapshotFaceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  dragSnapshotStrokeBufferCache: WeakMap<number[], WebGLBuffer>,
): TDrawSceneContext => ({
  buffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl,
  imageContext: {
    cache: IMAGE_TEXTURE_CACHE,
    dragGradientProgram: DRAG_GRADIENT_PROGRAM,
    dragSnapshotFaceBufferCache,
    dragSnapshotProgram,
    dragSnapshotStrokeBufferCache,
    imagePaintTextureSizeCache: IMAGE_PAINT_TEXTURE_SIZE_CACHE,
    isAlphaWriteEnabled: false,
    patternTileProgram: PATTERN_TILE_PROGRAM,
    program: IMAGE_PROGRAM,
  } as TDrawSceneContext['imageContext'],
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
});

describe('drawVectorNodeDragSnapshot', () => {
  beforeEach(() => {
    drawVectorFillPaintsMock.mockClear();
    drawVectorThickStrokeVerticesMock.mockClear();
  });

  it('should bind the drag-snapshot program and set u_translate to the snapshot delta before drawing anything', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const strokeBufferCache = new WeakMap<number[], WebGLBuffer>();
    const translateLocation = {} as WebGLUniformLocation;

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockReturnValue(translateLocation);

    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [],
      strokeVertices: [],
      strokes: [{ color: '#0d99ff', opacity: 100, type: 'solid' }],
    };

    // before
    drawVectorNodeDragSnapshot(buildContext(gl, buffer, program, faceBufferCache, strokeBufferCache), snapshot);

    // result
    expect(gl.getUniformLocation).toHaveBeenCalledWith(program, 'u_translate');
    expect(gl.useProgram).toHaveBeenCalledWith(program);
    expect(gl.uniform2f).toHaveBeenCalledWith(translateLocation, 5, 10);
  });

  it('should draw each paint group’s untranslated faces once, through the persistent drag-snapshot face buffer cache', () => {
    // mock — no CPU translation any more: the same (untranslated) points/cache go straight through,
    // the delta is applied entirely by the u_translate uniform on the GPU side
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const strokeBufferCache = new WeakMap<number[], WebGLBuffer>();
    const faceA: TPoint[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    const faceB: TPoint[] = [{ x: 2, y: 2 }];
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [
        { paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], points: [faceA] },
        { paint: [{ color: '#00ff00', opacity: 100, type: 'solid' }], points: [faceB] },
      ],
      strokeVertices: [],
      strokes: [{ color: '#0d99ff', opacity: 100, type: 'solid' }],
    };

    // before
    drawVectorNodeDragSnapshot(buildContext(gl, buffer, program, faceBufferCache, strokeBufferCache), snapshot);

    // result
    expect(drawVectorFillPaintsMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillPaintsMock.mock.calls[0][9]).toBeNull();
    expect(drawVectorFillPaintsMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      DRAG_GRADIENT_PROGRAM,
      PATTERN_TILE_PROGRAM,
      IMAGE_PROGRAM,
      IMAGE_TEXTURE_CACHE,
      IMAGE_PAINT_TEXTURE_SIZE_CACHE,
      buffer,
      faceBufferCache,
      null,
      [faceA],
      snapshot.facesByPaint[0].paint,
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      undefined,
    );
    expect(drawVectorFillPaintsMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      DRAG_GRADIENT_PROGRAM,
      PATTERN_TILE_PROGRAM,
      IMAGE_PROGRAM,
      IMAGE_TEXTURE_CACHE,
      IMAGE_PAINT_TEXTURE_SIZE_CACHE,
      buffer,
      faceBufferCache,
      null,
      [faceB],
      snapshot.facesByPaint[1].paint,
      [],
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
      undefined,
    );
  });

  it('should draw the untranslated stroke vertex list once, through the persistent drag-snapshot stroke buffer cache', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const strokeBufferCache = new WeakMap<number[], WebGLBuffer>();
    const strokeVertices = [0, 0, 10, 0, 10, 1, 0, 1];
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 3,
      deltaY: 4,
      facesByPaint: [],
      strokeVertices,
      strokes: [{ color: '#0d99ff', opacity: 100, type: 'solid' }],
    };

    // before
    drawVectorNodeDragSnapshot(buildContext(gl, buffer, program, faceBufferCache, strokeBufferCache), snapshot);

    // result
    expect(drawVectorFillPaintsMock).not.toHaveBeenCalled();
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      strokeBufferCache,
      strokeVertices,
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
      1,
    );
  });

  it('should lay the fill of every group of areas over the whole vector bounds', () => {
    // mock
    const fillBounds = { height: 100, width: 200, x: -50, y: -20 };
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 0,
      deltaY: 0,
      facesByPaint: [{ paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], points: [[{ x: 0, y: 0 }]] }],
      fillBounds,
      strokeVertices: [],
      strokes: [],
    };

    // before
    drawVectorNodeDragSnapshot(buildContext(createGlMock(), {} as WebGLBuffer, {} as WebGLProgram, new WeakMap(), new WeakMap()), snapshot);

    // result
    expect(drawVectorFillPaintsMock.mock.calls[0][9]).toBe(fillBounds);
  });

  it('should draw a group of areas with its own blend mode through the blend pass, moved by the drag', () => {
    // mock
    const paint = [{ blendMode: BlendMode.difference, color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const context = buildContext(createGlMock(), {} as WebGLBuffer, {} as WebGLProgram, new WeakMap(), new WeakMap());
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [{ paint, points: [[{ x: 1, y: 2 }]] }],
      fillBounds: { height: 4, width: 3, x: 1, y: 2 },
      strokeVertices: [],
      strokes: [],
    };

    drawVectorFillPaintsMock.mockClear();

    // before
    drawVectorNodeDragSnapshot(context, snapshot);
    drawVectorNodeDragSnapshot(context, { ...snapshot, fillBounds: undefined });

    // result
    expect(drawVectorFillPaintsMock).not.toHaveBeenCalled();
    expect(drawVectorFillGroupMock).toHaveBeenNthCalledWith(
      1,
      context,
      null,
      { height: 4, width: 3, x: 6, y: 12 },
      [[{ x: 6, y: 12 }]],
      paint,
      [],
      undefined,
    );
    expect(drawVectorFillGroupMock).toHaveBeenNthCalledWith(2, context, null, null, [[{ x: 6, y: 12 }]], paint, [], undefined);
  });

  it('should move an image fill with the drag instead of leaving the image behind', () => {
    // mock
    const paint = [{ opacity: 100, ref: 'photo.png', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const }];
    const context = buildContext(createGlMock(), {} as WebGLBuffer, {} as WebGLProgram, new WeakMap(), new WeakMap());

    drawVectorFillPaintsMock.mockClear();
    drawVectorFillGroupMock.mockClear();

    // before
    drawVectorNodeDragSnapshot(context, {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [{ paint, points: [[{ x: 1, y: 2 }]] }],
      fillBounds: { height: 4, width: 3, x: 1, y: 2 },
      strokeVertices: [],
      strokes: [],
    });

    // result
    expect(drawVectorFillPaintsMock).not.toHaveBeenCalled();
    expect(drawVectorFillGroupMock).toHaveBeenCalledWith(
      context,
      null,
      { height: 4, width: 3, x: 6, y: 12 },
      [[{ x: 6, y: 12 }]],
      paint,
      [],
      undefined,
    );
  });

  it('should keep the fill of a rotated vector turned while it moves with the drag', () => {
    // mock
    const paint = [{ opacity: 100, ref: 'clip.mp4', rotation: 0, scaleMode: 'fill' as const, type: 'video' as const }];
    const context = buildContext(createGlMock(), {} as WebGLBuffer, {} as WebGLProgram, new WeakMap(), new WeakMap());
    const fillRotation = { center: { x: 5, y: 5 }, degrees: 30, localBounds: { height: 10, width: 10, x: 0, y: 0 } };

    drawVectorFillGroupMock.mockClear();

    // before
    drawVectorNodeDragSnapshot(context, {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [{ paint, points: [[{ x: 1, y: 2 }]] }],
      fillRotation,
      strokeVertices: [],
      strokes: [],
    });

    // result
    expect(drawVectorFillGroupMock.mock.calls[0][6]).toEqual({
      center: { x: 10, y: 15 },
      degrees: 30,
      localBounds: { height: 10, width: 10, x: 5, y: 10 },
    });
  });
});
