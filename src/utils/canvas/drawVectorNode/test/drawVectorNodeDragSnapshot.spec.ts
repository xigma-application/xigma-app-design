// types
import { TPoint } from 'types/canvas';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeDragSnapshot } from '../drawVectorNodeDragSnapshot';

const drawVectorFillPaintsMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();

vi.mock('../drawVectorFillPaints', () => ({
  drawVectorFillPaints: (...args: unknown[]): void => drawVectorFillPaintsMock(...args),
}));
vi.mock('../drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createGlMock = (): WebGL2RenderingContext =>
  ({
    getUniformLocation: vi.fn(() => ({})),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

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
    drawVectorNodeDragSnapshot(gl, program, buffer, faceBufferCache, strokeBufferCache, snapshot, 200, 150, IDENTITY_VIEWPORT, false);

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
    drawVectorNodeDragSnapshot(gl, program, buffer, faceBufferCache, strokeBufferCache, snapshot, 200, 150, IDENTITY_VIEWPORT, false);

    // result
    expect(drawVectorFillPaintsMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillPaintsMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      faceBufferCache,
      null,
      [faceA],
      snapshot.facesByPaint[0].paint,
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
    );
    expect(drawVectorFillPaintsMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      faceBufferCache,
      null,
      [faceB],
      snapshot.facesByPaint[1].paint,
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
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
    drawVectorNodeDragSnapshot(gl, program, buffer, faceBufferCache, strokeBufferCache, snapshot, 200, 150, IDENTITY_VIEWPORT, false);

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
    );
  });
});
