// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../../types';
import { TImageRenderContext } from '../../../../../types';
import { TRenderTarget, TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { compositeBlend } from '../../../compositeBlend';
import { drawVectorFillGroup } from '../drawVectorFillGroup';
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { setAlphaWriteEnabled } from 'utils/canvas/setAlphaWriteEnabled';

vi.mock('../../../compositeBlend', () => ({ compositeBlend: vi.fn() }));
vi.mock('utils/canvas/drawVectorNode/drawVectorFillPaints', () => ({ drawVectorFillPaints: vi.fn() }));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: vi.fn((_gl, imageContext, enabled) => {
    imageContext.isAlphaWriteEnabled = enabled;
  }),
}));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    BLEND_DST_ALPHA: 32970,
    BLEND_DST_RGB: 32968,
    BLEND_SRC_ALPHA: 32971,
    BLEND_SRC_RGB: 32969,
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_BINDING: 36006,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 771,
    RGBA: 6408,
    SRC_ALPHA: 770,
    STENCIL_BUFFER_BIT: 1024,
    TEXTURE_2D: 3553,
    VIEWPORT: 2978,
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    blendFuncSeparate: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    copyTexImage2D: vi.fn(),
    drawingBufferHeight: 200,
    drawingBufferWidth: 200,
    getParameter: vi.fn((param: number) => {
      if (param === 36006) {
        return { tag: 'previous-framebuffer' };
      }

      if (param === 2978) {
        return new Int32Array([1, 2, 100, 150]);
      }

      return `blend-func-${param}`;
    }),
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const GRADIENT_PROGRAM = {} as WebGLProgram;
const PATTERN_TILE_PROGRAM = {} as WebGLProgram;

const createContext = (gl: WebGL2RenderingContext, pool: TRenderTargetPool): TDrawSceneContext =>
  ({
    buffer: {} as WebGLBuffer,
    canvasHeight: 200,
    canvasWidth: 200,
    gl,
    imageContext: {
      gradientProgram: GRADIENT_PROGRAM,
      isAlphaWriteEnabled: false,
      patternTileProgram: PATTERN_TILE_PROGRAM,
      renderTargetPool: pool,
    } as unknown as TImageRenderContext,
    program: {} as WebGLProgram,
    viewport: { x: 0, y: 0, zoom: 1 },
  }) as TDrawSceneContext;

describe('drawVectorFillGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the group directly, with no isolation, when no real blend mode is set', () => {
    // mock
    const gl = createGlMock();
    const pool = { acquire: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const context = createContext(gl, pool);
    const paint = [makeSolidPaint('#ff0000')];
    const polygons = [[{ x: 0, y: 0 }]];

    // action
    drawVectorFillGroup(context, null, null, polygons, paint);

    // result
    expect(drawVectorFillPaints).toHaveBeenCalledWith(
      gl,
      context.program,
      GRADIENT_PROGRAM,
      PATTERN_TILE_PROGRAM,
      context.buffer,
      null,
      null,
      polygons,
      paint,
      [],
      200,
      200,
      context.viewport,
      false,
    );
    expect(pool.acquire).not.toHaveBeenCalled();
    expect(compositeBlend).not.toHaveBeenCalled();
  });

  it('should isolate the group, capture the backdrop, and composite it with the blend mode when a real blend mode is set', () => {
    // mock
    const gl = createGlMock();
    const backdrop = { tag: 'backdrop', texture: { tag: 'backdrop-texture' } } as unknown as TRenderTarget;
    const contentTarget = {
      framebuffer: { tag: 'fbo' },
      height: 200,
      tag: 'content',
      texture: { tag: 'content-texture' },
      width: 200,
    } as unknown as TRenderTarget;
    const pool = {
      acquire: vi.fn().mockReturnValueOnce(backdrop).mockReturnValueOnce(contentTarget),
      release: vi.fn(),
    } as unknown as TRenderTargetPool;
    const context = createContext(gl, pool);
    const paint = [{ ...makeSolidPaint('#ff0000'), blendMode: BlendMode.multiply }];
    const polygons = [[{ x: 0, y: 0 }]];

    // action
    drawVectorFillGroup(context, null, null, polygons, paint);

    // result — backdrop copied from whatever was bound before touching anything
    expect(gl.copyTexImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, 200, 200, 0);

    // result — the group is rendered into the isolated content target with alpha write forced on
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, contentTarget.framebuffer);
    expect(setAlphaWriteEnabled).toHaveBeenCalledWith(gl, context.imageContext, true);
    expect(drawVectorFillPaints).toHaveBeenCalledWith(
      gl,
      context.program,
      GRADIENT_PROGRAM,
      PATTERN_TILE_PROGRAM,
      context.buffer,
      null,
      null,
      polygons,
      paint,
      [],
      200,
      200,
      context.viewport,
      true,
    );

    // result — the previous framebuffer/viewport/blend func/alpha-write state is restored before compositing
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenCalledWith(1, 2, 100, 150);
    expect(setAlphaWriteEnabled).toHaveBeenCalledWith(gl, context.imageContext, false);

    // result — composited with the group's blend mode, then both pool targets released
    expect(compositeBlend).toHaveBeenCalledWith(context, contentTarget.texture, backdrop.texture, BlendMode.multiply);
    expect(pool.release).toHaveBeenCalledWith(contentTarget);
    expect(pool.release).toHaveBeenCalledWith(backdrop);
  });

  it("should enable alpha writes on the content target before clearing it, not after, so a recycled target's stale alpha is actually reset", () => {
    // mock — clearing while alpha writes are still masked off (left over from a prior draw) would
    // leave old opaque pixels behind, showing as a dark "shadow" once new content draws on top
    const gl = createGlMock();
    const backdrop = { tag: 'backdrop', texture: { tag: 'backdrop-texture' } } as unknown as TRenderTarget;
    const contentTarget = {
      framebuffer: { tag: 'fbo' },
      height: 200,
      tag: 'content',
      texture: { tag: 'content-texture' },
      width: 200,
    } as unknown as TRenderTarget;
    const pool = {
      acquire: vi.fn().mockReturnValueOnce(backdrop).mockReturnValueOnce(contentTarget),
      release: vi.fn(),
    } as unknown as TRenderTargetPool;
    const context = createContext(gl, pool);
    const paint = [{ ...makeSolidPaint('#ff0000'), blendMode: BlendMode.multiply }];
    const polygons = [[{ x: 0, y: 0 }]];

    // action
    drawVectorFillGroup(context, null, null, polygons, paint);

    // result — the first setAlphaWriteEnabled(true) call (enabling the content target) happens
    // before clear() touches that same target
    const enableAlphaCall = (setAlphaWriteEnabled as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const clearCall = (gl.clear as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];

    expect(enableAlphaCall).toBeLessThan(clearCall);
  });
});
