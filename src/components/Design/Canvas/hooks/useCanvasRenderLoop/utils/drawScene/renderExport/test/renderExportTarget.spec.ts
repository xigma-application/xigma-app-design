// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { renderExportTarget } from '../renderExportTarget';

const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();
const createFixedRenderTargetPoolMock = vi.fn();

vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createTarget', () => ({
  createTarget: (...args: unknown[]): unknown => createTargetMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/disposeTarget', () => ({
  disposeTarget: (...args: unknown[]): void => disposeTargetMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): void => setAlphaWriteEnabledMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createFixedRenderTargetPool', () => ({
  createFixedRenderTargetPool: (...args: unknown[]): unknown => createFixedRenderTargetPoolMock(...args),
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
    UNSIGNED_BYTE: 5121,
    VIEWPORT: 2978,
    bindFramebuffer: vi.fn(),
    blendFuncSeparate: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    getParameter: vi.fn((param: number) => {
      if (param === 36006) {
        return { tag: 'previous-framebuffer' };
      }

      if (param === 2978) {
        return new Int32Array([0, 0, 400, 300]);
      }

      return `blend-func-${param}`;
    }),
    readPixels: vi.fn(),
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fills: [],
    height: 20,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('renderExportTarget', () => {
  beforeEach(() => {
    createTargetMock.mockClear();
    disposeTargetMock.mockClear();
    setAlphaWriteEnabledMock.mockClear();
    createFixedRenderTargetPoolMock.mockClear();
    createFixedRenderTargetPoolMock.mockReturnValue({ acquire: vi.fn(), dispose: vi.fn(), release: vi.fn() });
  });

  it('should return null when the source node does not exist', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const draw = vi.fn();

    // before
    const result = renderExportTarget(context, 'missing', {}, 2, undefined, draw);

    // result
    expect(result).toBeNull();
    expect(createTargetMock).not.toHaveBeenCalled();
    expect(draw).not.toHaveBeenCalled();
  });

  it('should return null for a hidden source node', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { hidden: true }) };
    const draw = vi.fn();

    // before
    const result = renderExportTarget(context, 'r1', nodesById, 2, undefined, draw);

    // result
    expect(result).toBeNull();
    expect(draw).not.toHaveBeenCalled();
  });

  it('should return null for a degenerate (zero-size) source node', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { height: 0 }) };
    const draw = vi.fn();

    // before
    const result = renderExportTarget(context, 'r1', nodesById, 2, undefined, draw);

    // result
    expect(result).toBeNull();
    expect(draw).not.toHaveBeenCalled();
  });

  it('should set up the export target at the exact requested scale, invoke draw once, and read it back upright', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 100, texture: {}, width: 200 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const imageContext = { isAlphaWriteEnabled: false, renderTargetPool: { tag: 'live-canvas-pool' } };
    const context = { gl, imageContext } as unknown as TDrawSceneContext;
    const nodesById = { f1: rect('f1', { height: 50, type: NodeType.frame, width: 100, x: 10, y: 20 }) };
    const draw = vi.fn();
    const fixedPool = { acquire: vi.fn(), dispose: vi.fn(), release: vi.fn() };

    createFixedRenderTargetPoolMock.mockReturnValue(fixedPool);

    // before — an explicit 2x scale, independent of any "fit into a square" computation
    const result = renderExportTarget(context, 'f1', nodesById, 2, undefined, draw);

    // result — 100x50 scaled by 2 -> 200x100, not clamped to any square/size limit
    expect(createTargetMock).toHaveBeenCalledWith(gl, 200, 100);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, target.framebuffer);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 200, 100);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(1, gl, imageContext, true);

    // result — a fresh pool sized to this export's own target replaces the live canvas's shared,
    // real-screen-sized pool inside the context handed to draw, so every scratch allocation reached
    // through context.imageContext.renderTargetPool (not just through a TMaskRenderer) is sized
    // correctly too
    expect(createFixedRenderTargetPoolMock).toHaveBeenCalledWith(gl, 200, 100);

    // result — draw is called once with a synthetic viewport mapping the node's own bounds to the
    // exact requested scale, and the freshly created target
    expect(draw).toHaveBeenCalledTimes(1);
    const [drawnContext, drawnTarget] = draw.mock.calls[0] as [TDrawSceneContext, TRenderTarget];

    expect(drawnContext.canvasWidth).toBe(200);
    expect(drawnContext.canvasHeight).toBe(100);
    expect(drawnContext.viewport).toEqual({ x: -20, y: -40, zoom: 2 });
    expect(drawnContext.imageContext.renderTargetPool).toBe(fixedPool);
    expect(drawnContext.imageContext.isAlphaWriteEnabled).toBe(imageContext.isAlphaWriteEnabled);
    expect(drawnTarget).toBe(target);
    expect(fixedPool.dispose).toHaveBeenCalledTimes(1);

    // result — pixels read back at the target's own resolution, then previous GL state restored
    expect(gl.readPixels).toHaveBeenCalledWith(0, 0, 200, 100, gl.RGBA, gl.UNSIGNED_BYTE, expect.any(Uint8Array));
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 400, 300);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(2, gl, imageContext, false);
    expect(disposeTargetMock).toHaveBeenCalledWith(gl, target);

    // result — the live canvas's own shared pool is left completely untouched
    expect(imageContext.renderTargetPool).toEqual({ tag: 'live-canvas-pool' });

    // result
    expect(result).toEqual({ height: 100, pixels: expect.any(Uint8Array), width: 200 });
    expect(result?.pixels).toHaveLength(200 * 100 * 4);
  });

  it('should return null when sourceNodeId is null (whole-page export) and no bounds override was given', () => {
    // mock — a null sourceNodeId means there is no single node to fall back to for bounds, so a
    // whole-page export with no computed union bounds cannot proceed
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const draw = vi.fn();

    // before
    const result = renderExportTarget(context, null, {}, 2, undefined, draw);

    // result
    expect(result).toBeNull();
    expect(createTargetMock).not.toHaveBeenCalled();
    expect(draw).not.toHaveBeenCalled();
  });

  it('should render at the given bounds override with a null sourceNodeId, without looking up any node', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 10, texture: {}, width: 10 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const boundsOverride = { height: 10, width: 10, x: 20, y: 20 };
    const draw = vi.fn();

    // before — nodesById is empty; nothing is ever looked up in it when sourceNodeId is null
    const result = renderExportTarget(context, null, {}, 1, boundsOverride, draw);

    // result
    expect(createTargetMock).toHaveBeenCalledWith(gl, 10, 10);
    expect(result).toEqual({ height: 10, pixels: expect.any(Uint8Array), width: 10 });

    const [drawnContext] = draw.mock.calls[0] as [TDrawSceneContext];

    expect(drawnContext.viewport).toEqual({ x: -20, y: -20, zoom: 1 });
  });

  it('should clear the target to the given backgroundColor instead of transparent when one is provided', () => {
    // mock — a whole-page export seeds the page's own background color instead of starting transparent
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 10, texture: {}, width: 10 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const boundsOverride = { height: 10, width: 10, x: 0, y: 0 };
    const draw = vi.fn();

    // before
    renderExportTarget(context, null, {}, 1, boundsOverride, draw, [0.2, 0.4, 0.6, 1]);

    // result
    expect(gl.clearColor).toHaveBeenCalledWith(0.2, 0.4, 0.6, 1);
  });

  it('should clear the target to fully transparent when no backgroundColor is given', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 10, texture: {}, width: 10 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const nodesById = { f1: rect('f1', { height: 10, width: 10, x: 0, y: 0 }) };
    const draw = vi.fn();

    // before
    renderExportTarget(context, 'f1', nodesById, 1, undefined, draw);

    // result
    expect(gl.clearColor).toHaveBeenCalledWith(0, 0, 0, 0);
  });

  it('should use an explicit bounds override instead of the source node own declared bounds when given one', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 10, texture: {}, width: 10 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const nodesById = { f1: rect('f1', { height: 200, type: NodeType.frame, width: 200, x: 0, y: 0 }) };
    const boundsOverride = { height: 10, width: 10, x: 20, y: 20 };
    const draw = vi.fn();

    // before — the node's own declared bounds are 200x200, but the override should win instead
    const result = renderExportTarget(context, 'f1', nodesById, 1, boundsOverride, draw);

    // result
    expect(createTargetMock).toHaveBeenCalledWith(gl, 10, 10);
    expect(result).toEqual({ height: 10, pixels: expect.any(Uint8Array), width: 10 });

    const [drawnContext] = draw.mock.calls[0] as [TDrawSceneContext];

    expect(drawnContext.viewport).toEqual({ x: -20, y: -20, zoom: 1 });
  });
});
