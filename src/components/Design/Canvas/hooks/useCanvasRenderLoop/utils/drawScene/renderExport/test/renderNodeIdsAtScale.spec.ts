// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TMaskRenderer } from '../../drawSceneNodes/types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { renderNodeIdsAtScale } from '../renderNodeIdsAtScale';

const buildExportMaskRendererMock = vi.fn();
const getTopLevelIdsMock = vi.fn();
const renderExportTargetMock = vi.fn();
const releaseGlassBackdropMock = vi.fn();
const renderHoistedIdsMock = vi.fn();
const renderIdsMock = vi.fn();

vi.mock('../buildExportMaskRenderer', () => ({
  buildExportMaskRenderer: (...args: unknown[]): unknown => buildExportMaskRendererMock(...args),
}));
vi.mock('../getTopLevelIds', () => ({ getTopLevelIds: (...args: unknown[]): unknown => getTopLevelIdsMock(...args) }));
vi.mock('../renderExportTarget', () => ({
  renderExportTarget: (...args: unknown[]): unknown => renderExportTargetMock(...args),
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

const rect = (id: string): TSceneNode =>
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
  }) as TSceneNode;

describe('renderNodeIdsAtScale', () => {
  const refs = createCanvasRefs();
  const context = {} as TDrawSceneContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate the target lifecycle to renderExportTarget, forwarding sourceNodeId/nodesById/scale/boundsOverride', () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const nodesById = { r1: rect('r1') };
    const boundsOverride = { height: 5, width: 5, x: 0, y: 0 };

    renderExportTargetMock.mockReturnValue(pixels);

    // before
    const result = renderNodeIdsAtScale(context, 'f1', ['r1'], nodesById, refs, 2, boundsOverride);

    // result
    expect(renderExportTargetMock).toHaveBeenCalledWith(context, 'f1', nodesById, 2, boundsOverride, expect.any(Function), undefined);
    expect(result).toBe(pixels);
  });

  it('should forward an explicit backgroundColor through to renderExportTarget (whole-page export needs it to seed the page background)', () => {
    // mock
    const nodesById = { r1: rect('r1') };
    const boundsOverride = { height: 5, width: 5, x: 0, y: 0 };
    const backgroundColor = [0.2, 0.2, 0.2, 1] as const;

    renderExportTargetMock.mockReturnValue(null);

    // before — sourceNodeId is null, matching a whole-page export with no single root node
    renderNodeIdsAtScale(context, null, ['r1'], nodesById, refs, 2, boundsOverride, backgroundColor);

    // result
    expect(renderExportTargetMock).toHaveBeenCalledWith(
      context,
      null,
      nodesById,
      2,
      boundsOverride,
      expect.any(Function),
      backgroundColor,
    );
  });

  it('should render only the top-level ids within the given set (filtering out any id whose ancestor is also in the set), through the real per-node effect dispatch', () => {
    // mock
    const nodesById = { c1: rect('c1'), c2: rect('c2') };
    const target = { framebuffer: {}, height: 40, texture: {}, width: 40 } as unknown as TRenderTarget;
    const drawnContext = { canvasHeight: 40, canvasWidth: 40, gl: { tag: 'gl' } } as unknown as TDrawSceneContext;
    const renderer = { tag: 'renderer' } as unknown as TMaskRenderer;

    renderExportTargetMock.mockImplementation((...args: unknown[]) => {
      const draw = args[5] as (renderContext: TDrawSceneContext, renderTarget: TRenderTarget) => void;
      draw(drawnContext, target);
      return null;
    });
    buildExportMaskRendererMock.mockReturnValue(renderer);
    getTopLevelIdsMock.mockReturnValue(['c1']);

    // before — a wider raw id set than what actually ends up rendered
    renderNodeIdsAtScale(context, 'f1', ['c1', 'c2'], nodesById, refs, 1);

    // result — the raw id list is filtered through getTopLevelIds before it ever reaches renderIds,
    // so a frame and its own already-listed child never both get drawn (which would double-draw the
    // child once via the frame's own recursion and once via its separate list entry)
    expect(getTopLevelIdsMock).toHaveBeenCalledWith(['c1', 'c2'], nodesById);
    expect(buildExportMaskRendererMock).toHaveBeenCalledWith(drawnContext, nodesById, refs);
    expect(renderIdsMock).toHaveBeenCalledWith(renderer, ['c1'], target);
    expect(renderHoistedIdsMock).toHaveBeenCalledWith(renderer);
    expect(releaseGlassBackdropMock).toHaveBeenCalledWith(renderer);
  });
});
