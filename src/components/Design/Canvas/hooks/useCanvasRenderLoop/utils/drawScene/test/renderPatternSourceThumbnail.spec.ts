// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { renderPatternSourceThumbnail } from '../renderPatternSourceThumbnail';

const drawLeafNodeMock = vi.fn();
const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();

vi.mock('../drawLeafNode', () => ({ drawLeafNode: (...args: unknown[]): void => drawLeafNodeMock(...args) }));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createTarget', () => ({
  createTarget: (...args: unknown[]): unknown => createTargetMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/disposeTarget', () => ({
  disposeTarget: (...args: unknown[]): void => disposeTargetMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): void => setAlphaWriteEnabledMock(...args),
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

describe('renderPatternSourceThumbnail', () => {
  const refs = createCanvasRefs();

  beforeEach(() => {
    drawLeafNodeMock.mockClear();
    createTargetMock.mockClear();
    disposeTargetMock.mockClear();
    setAlphaWriteEnabledMock.mockClear();
  });

  it('should return null when the source node does not exist', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;

    // before
    const result = renderPatternSourceThumbnail(context, 'missing', {}, refs, 256, []);

    // result
    expect(result).toBeNull();
    expect(createTargetMock).not.toHaveBeenCalled();
  });

  it('should return null for a hidden source node', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { hidden: true }) };

    // before
    const result = renderPatternSourceThumbnail(context, 'r1', nodesById, refs, 256, []);

    // result
    expect(result).toBeNull();
  });

  it('should return null for a degenerate (zero-size) source node', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { height: 0 }) };

    // before
    const result = renderPatternSourceThumbnail(context, 'r1', nodesById, refs, 256, []);

    // result
    expect(result).toBeNull();
  });

  it('should render the source subtree at a scale that fits its bounds into the requested size, and read it back upright', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'thumbnail-fbo' }, height: 100, texture: {}, width: 200 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const imageContext = { isAlphaWriteEnabled: false };
    const context = { gl, imageContext } as unknown as TDrawSceneContext;
    const child = rect('c1');
    // a wide (2:1) source, scaled to fit inside a 256x256 request — width becomes the limiting axis
    const parent = { ...rect('f1', { height: 50, width: 100, x: 10, y: 20 }), childIds: ['c1'], type: NodeType.frame } as TSceneNode;
    const nodesById = { c1: child, f1: parent };

    // before
    const result = renderPatternSourceThumbnail(context, 'f1', nodesById, refs, 256, []);

    // result — 100x50 scaled by 2.56 (256/100) fits exactly, since the height axis (50*2.56=128) stays under 256
    expect(createTargetMock).toHaveBeenCalledWith(gl, 256, 128);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, target.framebuffer);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 256, 128);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(1, gl, imageContext, true);

    // result — both the source and its child were drawn, using a synthetic viewport that maps the
    // node's own bounds to fill the thumbnail, independent of the live canvas viewport
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(2);
    const [drawnContext] = drawLeafNodeMock.mock.calls[0] as [TDrawSceneContext];

    expect(drawnContext.canvasWidth).toBe(256);
    expect(drawnContext.canvasHeight).toBe(128);
    expect(drawnContext.viewport).toEqual({ x: -10 * 2.56, y: -20 * 2.56, zoom: 2.56 });
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(1, drawnContext, parent, new Map(), refs, nodesById, null, 0);
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(2, drawnContext, child, new Map(), refs, nodesById, null, 0);

    // result — pixels read back at the target's own resolution, then previous GL state restored
    expect(gl.readPixels).toHaveBeenCalledWith(0, 0, 256, 128, gl.RGBA, gl.UNSIGNED_BYTE, expect.any(Uint8Array));
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 400, 300);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(2, gl, imageContext, false);
    expect(disposeTargetMock).toHaveBeenCalledWith(gl, target);

    // result
    expect(result).toEqual({ height: 128, pixels: expect.any(Uint8Array), width: 256 });
    expect(result?.pixels).toHaveLength(256 * 128 * 4);
  });

  it('should render the whole page over the page background, and nothing for an empty page', () => {
    // mock
    const gl = createGlMock();
    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const visible = rect('p1', { height: 50, width: 100 });
    const hidden = rect('p2', { hidden: true });
    const background = [1, 0, 0, 1] as const;

    createTargetMock.mockReturnValue({ framebuffer: {}, height: 1, texture: {}, width: 1 });

    // before
    const result = renderPatternSourceThumbnail(context, null, { p1: visible, p2: hidden }, refs, 100, ['p1', 'p2'], background);

    // result
    expect(result).toEqual({ height: 50, pixels: expect.any(Uint8Array), width: 100 });
    expect(gl.clearColor).toHaveBeenCalledWith(...background);
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(1);
    expect(renderPatternSourceThumbnail(context, null, {}, refs, 100, [], background)).toBeNull();
  });

  it('should render the page area under a slice over the page background', () => {
    // mock
    const gl = createGlMock();
    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const shape = rect('p1', { height: 400, width: 400 });
    const slice = rect('s1', { height: 20, type: NodeType.slice, width: 40, x: 10, y: 10 });
    const background = [0, 1, 0, 1] as const;

    createTargetMock.mockReturnValue({ framebuffer: {}, height: 1, texture: {}, width: 1 });

    // before
    const result = renderPatternSourceThumbnail(context, 's1', { p1: shape, s1: slice }, refs, 80, ['p1', 's1'], background);

    // result
    expect(result).toEqual({ height: 40, pixels: expect.any(Uint8Array), width: 80 });
    expect(gl.clearColor).toHaveBeenCalledWith(...background);
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(2);
  });
});
