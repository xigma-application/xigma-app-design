import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

// hooks
import { getFrameNameLabelEditTarget } from '../getFrameNameLabelEditTarget';
import { TFrameNameLabelRect } from '../../../../utils/getFrameNameLabelRects';

// store
import designReducer, { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';

const getFrameNameLabelRectsMock = vi.fn();

vi.mock('../../../../utils/getFrameNameLabelRects', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../utils/getFrameNameLabelRects')>()),
  getFrameNameLabelRects: (...args: unknown[]): unknown => getFrameNameLabelRectsMock(...args),
}));

const createTestStore = (): EnhancedStore<RootState> => configureStore({ reducer: { design: designReducer } });

const addFrame = (
  store: EnhancedStore<RootState>,
  overrides: { hidden?: boolean; rotation?: number } = {},
): { id: string; name: string } => {
  store.dispatch(
    addNode({
      fill: '#ffffff',
      height: 100,
      hidden: overrides.hidden,
      name: 'Frame',
      parentId: null,
      rotation: overrides.rotation ?? 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { nodes, rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  return { id, name: nodes[id].name };
};

const rectFor = (nodeId: string): TFrameNameLabelRect => ({ center: { x: 100, y: -20 }, height: 24, nodeId, width: 60 });

describe('getFrameNameLabelEditTarget', () => {
  beforeEach(() => {
    getFrameNameLabelRectsMock.mockReset().mockReturnValue([]);
  });

  it('should return the target seeded with the hit node’s current name; left comes from the exact anchor, centerY from the hit rect', () => {
    // mock — an unrotated frame at world x=0, so its exact (unpadded) label left edge is also x=0
    const store = createTestStore();
    const frame = addFrame(store);

    getFrameNameLabelRectsMock.mockReturnValue([rectFor(frame.id)]);

    // result
    expect(getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState())).toEqual({
      angleDeg: 0,
      centerY: -20,
      height: 24,
      left: 0,
      nodeId: frame.id,
      value: frame.name,
    });
  });

  it('should carry the node’s current rotation through as the target’s angle', () => {
    // mock
    const store = createTestStore();
    const frame = addFrame(store, { rotation: 20 });

    getFrameNameLabelRectsMock.mockReturnValue([rectFor(frame.id)]);

    // result — under the 45° snap threshold, so the label still tracks the frame's own rotation
    expect(getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState())?.angleDeg).toBe(20);
  });

  it('should exclude hidden frames from hit-testing', () => {
    // mock
    const store = createTestStore();

    addFrame(store, { hidden: true });

    // before
    getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState());

    // result — the hidden frame never even reaches the rect builder
    expect(getFrameNameLabelRectsMock).toHaveBeenCalledWith([], expect.any(Number));
  });

  it('should return null when no label rect is hit', () => {
    // mock
    const store = createTestStore();

    addFrame(store);

    // result
    expect(getFrameNameLabelEditTarget({ x: 500, y: 500 }, store.getState())).toBeNull();
  });

  it('should return null when the hit rect points at a node that no longer exists', () => {
    // mock
    const store = createTestStore();

    getFrameNameLabelRectsMock.mockReturnValue([rectFor('gone')]);

    // result
    expect(getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState())).toBeNull();
  });

  it('should pick the specific rect that was hit when several frame label rects are on offer', () => {
    // mock — two frames, each with their own label rect; the point only lands inside the second one
    const store = createTestStore();
    const first = addFrame(store);
    const second = addFrame(store);
    const missedRect: TFrameNameLabelRect = { center: { x: 400, y: -20 }, height: 24, nodeId: first.id, width: 60 };

    getFrameNameLabelRectsMock.mockReturnValue([missedRect, rectFor(second.id)]);

    // result — the hit target is the second frame, not the first one offered
    expect(getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState())?.nodeId).toBe(second.id);
  });

  it('should return null when the hit rect points at a node that is no longer a frame', () => {
    // mock — a rectangle that happens to sit where a frame's rect id would point
    const store = createTestStore();

    store.dispatch(
      addNode({
        fill: '#ffffff',
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 200,
        x: 0,
        y: 0,
      }),
    );

    const { nodes, rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    getFrameNameLabelRectsMock.mockReturnValue([rectFor(id)]);

    // result
    expect(getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState())).toBeNull();
    expect(nodes[id].type).toBe(NodeType.rectangle);
  });
});
