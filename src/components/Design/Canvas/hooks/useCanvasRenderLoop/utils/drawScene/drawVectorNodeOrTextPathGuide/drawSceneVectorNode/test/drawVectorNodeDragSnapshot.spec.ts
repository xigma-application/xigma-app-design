// types
import { TDrawSceneContext } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeDragSnapshot } from '../drawVectorNodeDragSnapshot';

const drawVectorFillPaintsMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();

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

    const snapshot: TVectorNodeDragSnapshot = { deltaX: 5, deltaY: 10, facesByPaint: [], strokeColor: '#0d99ff', strokeVertices: [] };

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
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    drawVectorNodeDragSnapshot(buildContext(gl, buffer, program, faceBufferCache, strokeBufferCache), snapshot);

    // result
    expect(drawVectorFillPaintsMock).toHaveBeenCalledTimes(2);
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
    const snapshot: TVectorNodeDragSnapshot = { deltaX: 3, deltaY: 4, facesByPaint: [], strokeColor: '#0d99ff', strokeVertices };

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
});
