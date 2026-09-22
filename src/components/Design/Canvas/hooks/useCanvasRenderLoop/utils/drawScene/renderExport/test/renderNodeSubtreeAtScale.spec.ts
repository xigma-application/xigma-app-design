// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TMaskRenderer } from '../../drawSceneNodes/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { renderNodeSubtreeAtScale } from '../renderNodeSubtreeAtScale';

const drawLeafNodeMock = vi.fn();
const renderExportTargetMock = vi.fn();
const getHoistedDragIdsMock = vi.fn();
const markNodeDrawnOverGlassBackdropMock = vi.fn();
const releaseGlassBackdropMock = vi.fn();
const renderHoistedIdsMock = vi.fn();
const renderIdsMock = vi.fn();
const createFixedRenderTargetPoolMock = vi.fn();

vi.mock('../../drawLeafNode', () => ({ drawLeafNode: (...args: unknown[]): void => drawLeafNodeMock(...args) }));
vi.mock('../renderExportTarget', () => ({
  renderExportTarget: (...args: unknown[]): unknown => renderExportTargetMock(...args),
}));
vi.mock('../../drawSceneNodes/getHoistedDragIds', () => ({
  getHoistedDragIds: (...args: unknown[]): unknown => getHoistedDragIdsMock(...args),
}));
vi.mock('../../drawSceneNodes/markNodeDrawnOverGlassBackdrop', () => ({
  markNodeDrawnOverGlassBackdrop: (...args: unknown[]): void => markNodeDrawnOverGlassBackdropMock(...args),
}));
vi.mock('../../drawSceneNodes/releaseGlassBackdrop', () => ({
  releaseGlassBackdrop: (...args: unknown[]): void => releaseGlassBackdropMock(...args),
}));
vi.mock('../../drawSceneNodes/renderHoistedIds', () => ({
  renderHoistedIds: (...args: unknown[]): void => renderHoistedIdsMock(...args),
}));
vi.mock('../../drawSceneNodes/renderIds', () => ({
  renderIds: (...args: unknown[]): void => renderIdsMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createFixedRenderTargetPool', () => ({
  createFixedRenderTargetPool: (...args: unknown[]): unknown => createFixedRenderTargetPoolMock(...args),
}));

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

describe('renderNodeSubtreeAtScale', () => {
  const refs = createCanvasRefs();
  const context = {} as TDrawSceneContext;
  const hoistedIds = new Set<string>();

  beforeEach(() => {
    drawLeafNodeMock.mockClear();
    renderExportTargetMock.mockClear();
    getHoistedDragIdsMock.mockClear();
    markNodeDrawnOverGlassBackdropMock.mockClear();
    releaseGlassBackdropMock.mockClear();
    renderHoistedIdsMock.mockClear();
    renderIdsMock.mockClear();
    createFixedRenderTargetPoolMock.mockClear();
    getHoistedDragIdsMock.mockReturnValue(hoistedIds);
  });

  it('should delegate the target lifecycle to renderExportTarget, forwarding sourceNodeId/nodesById/scale/boundsOverride', () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const nodesById = { r1: rect('r1') };
    const boundsOverride = { height: 5, width: 5, x: 0, y: 0 };

    renderExportTargetMock.mockReturnValue(pixels);

    // before
    const result = renderNodeSubtreeAtScale(context, 'r1', nodesById, refs, 2, boundsOverride);

    // result
    expect(renderExportTargetMock).toHaveBeenCalledWith(context, 'r1', nodesById, 2, boundsOverride, expect.any(Function));
    expect(result).toBe(pixels);
  });

  it('should render just the source node id as the tree root, through the real per-node effect dispatch, into the export target', () => {
    // mock
    const frame = { ...rect('f1'), childIds: ['c1'], type: NodeType.frame } as TSceneNode;
    const child = rect('c1', { parentId: 'f1' });
    const nodesById = { c1: child, f1: frame };
    const target = { framebuffer: {}, height: 40, texture: {}, width: 40 } as unknown as TRenderTarget;
    const drawnContext = {
      canvasHeight: 40,
      canvasWidth: 40,
      gl: { tag: 'gl' },
      imageContext: { renderTargetPool: { tag: 'live-canvas-pool' } },
    } as unknown as TDrawSceneContext;
    const fixedPool = { acquire: vi.fn(), dispose: vi.fn(), release: vi.fn() };

    createFixedRenderTargetPoolMock.mockReturnValue(fixedPool);
    renderExportTargetMock.mockImplementation((...args: unknown[]) => {
      const draw = args[5] as (renderContext: TDrawSceneContext, renderTarget: TRenderTarget) => void;
      draw(drawnContext, target);
      return null;
    });

    // before — the tree root is the single source node id, not the caller-supplied flat list
    renderNodeSubtreeAtScale(context, 'f1', nodesById, refs, 1);

    // result — a fresh pool sized to the export's own target (not the live canvas's
    // gl.drawingBufferWidth/Height-sized shared pool) is built and disposed after rendering
    expect(createFixedRenderTargetPoolMock).toHaveBeenCalledWith(drawnContext.gl, target.width, target.height);
    expect(fixedPool.dispose).toHaveBeenCalledTimes(1);

    // result — renderIds walks the real childIds tree starting from just [sourceNodeId], into the
    // export's own render target (not the live-canvas default framebuffer)
    expect(renderIdsMock).toHaveBeenCalledTimes(1);
    const [renderer, ids, renderTarget] = renderIdsMock.mock.calls[0] as [TMaskRenderer, string[], TRenderTarget];

    expect(ids).toEqual(['f1']);
    expect(renderTarget).toBe(target);
    expect(renderer.context).toBe(drawnContext);
    expect(renderer.gl).toBe(drawnContext.gl);
    expect(renderer.hoistedIds).toBe(hoistedIds);
    expect(renderer.pool).toBe(fixedPool);
    expect(renderer.refs).toBe(refs);
    expect(renderer.sceneNodeById).toEqual(
      new Map([
        ['c1', child],
        ['f1', frame],
      ]),
    );

    // result — hoisted-drag and glass-backdrop bookkeeping mirror the live scene renderer
    expect(renderHoistedIdsMock).toHaveBeenCalledWith(renderer);
    expect(releaseGlassBackdropMock).toHaveBeenCalledWith(renderer);

    // result — the renderer's own paintLeaf both draws the leaf and tracks it for glass compositing,
    // exactly like the live canvas's renderer
    renderer.paintLeaf(child, 'fill');
    expect(drawLeafNodeMock).toHaveBeenCalledWith(drawnContext, child, new Map(), refs, nodesById, null, 0, 'fill');
    expect(markNodeDrawnOverGlassBackdropMock).toHaveBeenCalledWith(renderer, child);
  });
});
