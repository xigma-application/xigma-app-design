// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { buildExportMaskRenderer } from '../buildExportMaskRenderer';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

const drawLeafNodeMock = vi.fn();
const getHoistedDragIdsMock = vi.fn();
const markNodeDrawnOverGlassBackdropMock = vi.fn();

vi.mock('../../drawLeafNode', () => ({ drawLeafNode: (...args: unknown[]): void => drawLeafNodeMock(...args) }));
vi.mock('../../drawSceneNodes/getHoistedDragIds', () => ({
  getHoistedDragIds: (...args: unknown[]): unknown => getHoistedDragIdsMock(...args),
}));
vi.mock('../../drawSceneNodes/markNodeDrawnOverGlassBackdrop', () => ({
  markNodeDrawnOverGlassBackdrop: (...args: unknown[]): void => markNodeDrawnOverGlassBackdropMock(...args),
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

describe('buildExportMaskRenderer', () => {
  const refs = createCanvasRefs();
  const hoistedIds = new Set<string>();

  beforeEach(() => {
    vi.clearAllMocks();
    getHoistedDragIdsMock.mockReturnValue(hoistedIds);
  });

  it('should build a TMaskRenderer sourced from the given nodesById, gl and export-scoped pool', () => {
    // mock
    const nodesById = { r1: rect('r1') };
    const pool = { acquire: vi.fn(), dispose: vi.fn(), release: vi.fn() } as unknown as TRenderTargetPool;
    const renderContext = { gl: { tag: 'gl' }, imageContext: { renderTargetPool: pool } } as unknown as TDrawSceneContext;

    // action
    const renderer = buildExportMaskRenderer(renderContext, nodesById, refs);

    // result
    expect(renderer.context).toBe(renderContext);
    expect(renderer.gl).toBe(renderContext.gl);
    expect(renderer.hoistedIds).toBe(hoistedIds);
    expect(renderer.pool).toBe(pool);
    expect(renderer.refs).toBe(refs);
    expect(renderer.sceneNodeById).toEqual(new Map([['r1', nodesById.r1]]));
    expect(getHoistedDragIdsMock).toHaveBeenCalledWith(refs, renderer.sceneNodeById);
  });

  it("should have paintLeaf both draw the leaf and track it for glass compositing, mirroring the live scene renderer's own paintLeaf", () => {
    // mock
    const node = rect('r1');
    const nodesById = { r1: node };
    const renderContext = { gl: {}, imageContext: { renderTargetPool: {} } } as unknown as TDrawSceneContext;

    // action
    const renderer = buildExportMaskRenderer(renderContext, nodesById, refs);

    renderer.paintLeaf(node, 'fill');

    // result
    expect(drawLeafNodeMock).toHaveBeenCalledWith(renderContext, node, new Map(), refs, nodesById, null, 0, 'fill');
    expect(markNodeDrawnOverGlassBackdropMock).toHaveBeenCalledWith(renderer, node);
  });
});
