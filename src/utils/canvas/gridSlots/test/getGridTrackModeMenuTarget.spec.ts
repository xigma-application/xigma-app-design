// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackModeMenuRequest } from 'types/design/canvas/types';

// utils
import { getGridTrackModeMenuTarget } from '../getGridTrackModeMenuTarget';

const getGlyphQuadBoundsMock = vi.fn();

vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));

const BOUNDS = { maxX: 10, maxY: 5, minX: -10, minY: -5 };

const addFrame = (overrides: { rotation?: number } = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      gridColumnCount: 2,
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: overrides.rotation ?? 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('getGridTrackModeMenuTarget', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    getGlyphQuadBoundsMock.mockReset().mockReturnValue(BOUNDS);
  });

  it('should return null when the request’s frame id no longer resolves to a frame node', () => {
    const nodes = selectActivePage(store.getState()).nodes;
    const request: TGridTrackModeMenuRequest = { axis: 'column', frameId: 'gone', index: 0 };

    expect(getGridTrackModeMenuTarget(request, nodes, 1)).toBeNull();
  });

  it('should return null when the glyph atlas produces no bounds for the value text', () => {
    const frameId = addFrame();
    getGlyphQuadBoundsMock.mockReturnValue(null);
    const nodes = selectActivePage(store.getState()).nodes;
    const request: TGridTrackModeMenuRequest = { axis: 'column', frameId, index: 0 };

    expect(getGridTrackModeMenuTarget(request, nodes, 1)).toBeNull();
  });

  it('should resolve the requested column track into a menu target seeded with its mode and size', () => {
    const frameId = addFrame();
    const nodes = selectActivePage(store.getState()).nodes;
    const request: TGridTrackModeMenuRequest = { axis: 'column', frameId, index: 1 };

    const target = getGridTrackModeMenuTarget(request, nodes, 1);

    expect(target).not.toBeNull();
    expect(target).toMatchObject({ axis: 'column', frameId, index: 1, mode: SizingMode.fill, trackValue: 1 });
    expect(Number.isFinite(target!.anchor.x)).toBe(true);
    expect(Number.isFinite(target!.anchor.y)).toBe(true);
    expect(target!.resolvedSize).toBeGreaterThan(0);
  });

  it('should resolve the requested row track on the row axis', () => {
    const frameId = addFrame();
    const nodes = selectActivePage(store.getState()).nodes;
    const request: TGridTrackModeMenuRequest = { axis: 'row', frameId, index: 0 };

    const target = getGridTrackModeMenuTarget(request, nodes, 1);

    expect(target).toMatchObject({ axis: 'row', frameId, index: 0 });
  });

  it('should anchor a rotated frame’s chevron at a different screen point than an unrotated one', () => {
    const straightFrameId = addFrame({ rotation: 0 });
    const straightNodes = selectActivePage(store.getState()).nodes;
    const straight = getGridTrackModeMenuTarget({ axis: 'column', frameId: straightFrameId, index: 0 }, straightNodes, 1);

    store.dispatch(deleteNode(straightFrameId));

    const rotatedFrameId = addFrame({ rotation: 90 });
    const rotatedNodes = selectActivePage(store.getState()).nodes;
    const rotated = getGridTrackModeMenuTarget({ axis: 'column', frameId: rotatedFrameId, index: 0 }, rotatedNodes, 1);

    expect(rotated!.anchor).not.toEqual(straight!.anchor);
  });
});
