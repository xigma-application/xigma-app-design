// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { renderNodeAtScale } from '../renderNodeAtScale';

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

describe('renderNodeAtScale', () => {
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
    const result = renderNodeAtScale(context, 'missing', [], {}, refs, 2);

    // result
    expect(result).toBeNull();
    expect(createTargetMock).not.toHaveBeenCalled();
  });

  it('should return null for a hidden source node', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { hidden: true }) };

    // before
    const result = renderNodeAtScale(context, 'r1', [], nodesById, refs, 2);

    // result
    expect(result).toBeNull();
  });

  it('should return null for a degenerate (zero-size) source node', () => {
    // mock
    const context = { gl: createGlMock(), imageContext: {} } as unknown as TDrawSceneContext;
    const nodesById = { r1: rect('r1', { height: 0 }) };

    // before
    const result = renderNodeAtScale(context, 'r1', [], nodesById, refs, 2);

    // result
    expect(result).toBeNull();
  });

  it('should render the source subtree at the exact requested scale, and read it back upright', () => {
    // mock
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 100, texture: {}, width: 200 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const imageContext = { isAlphaWriteEnabled: false };
    const context = { gl, imageContext } as unknown as TDrawSceneContext;
    const child = rect('c1');
    const parent = { ...rect('f1', { height: 50, width: 100, x: 10, y: 20 }), childIds: ['c1'], type: NodeType.frame } as TSceneNode;
    const nodesById = { c1: child, f1: parent };

    // before — an explicit 2x scale, independent of any "fit into a square" computation
    const result = renderNodeAtScale(context, 'f1', [parent, child], nodesById, refs, 2);

    // result — 100x50 scaled by 2 -> 200x100, not clamped to any square/size limit
    expect(createTargetMock).toHaveBeenCalledWith(gl, 200, 100);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, target.framebuffer);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 200, 100);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(1, gl, imageContext, true);

    // result — both the source and its child were drawn, using a synthetic viewport that maps the
    // node's own bounds to the exact requested scale
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(2);
    const [drawnContext] = drawLeafNodeMock.mock.calls[0] as [TDrawSceneContext];

    expect(drawnContext.canvasWidth).toBe(200);
    expect(drawnContext.canvasHeight).toBe(100);
    expect(drawnContext.viewport).toEqual({ x: -20, y: -40, zoom: 2 });
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(1, drawnContext, parent, new Map(), refs, nodesById, null, 0);
    expect(drawLeafNodeMock).toHaveBeenNthCalledWith(2, drawnContext, child, new Map(), refs, nodesById, null, 0);

    // result — pixels read back at the target's own resolution, then previous GL state restored
    expect(gl.readPixels).toHaveBeenCalledWith(0, 0, 200, 100, gl.RGBA, gl.UNSIGNED_BYTE, expect.any(Uint8Array));
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 400, 300);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(2, gl, imageContext, false);
    expect(disposeTargetMock).toHaveBeenCalledWith(gl, target);

    // result
    expect(result).toEqual({ height: 100, pixels: expect.any(Uint8Array), width: 200 });
    expect(result?.pixels).toHaveLength(200 * 100 * 4);
  });

  it('should draw exactly the given node list, not derive the source node subtree itself', () => {
    // mock — an unrelated sibling passed in nodesToDraw, absent from the source node's own children,
    // proves the caller (not this function) decides which nodes end up on the canvas
    const gl = createGlMock();
    const target = { framebuffer: { tag: 'export-fbo' }, height: 20, texture: {}, width: 20 } as unknown as TRenderTarget;

    createTargetMock.mockReturnValue(target);

    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const source = rect('r1');
    const sibling = rect('r2', { x: 50 });
    const nodesById = { r1: source, r2: sibling };

    // before
    renderNodeAtScale(context, 'r1', [sibling], nodesById, refs, 1);

    // result
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(1);
    expect(drawLeafNodeMock).toHaveBeenCalledWith(expect.anything(), sibling, new Map(), refs, nodesById, null, 0);
  });
});
