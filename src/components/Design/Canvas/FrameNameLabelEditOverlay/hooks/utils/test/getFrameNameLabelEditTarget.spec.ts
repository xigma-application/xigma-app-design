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

const addFrame = (store: EnhancedStore<RootState>, overrides: { hidden?: boolean } = {}): { id: string; name: string } => {
  store.dispatch(
    addNode({
      fill: '#ffffff',
      height: 100,
      hidden: overrides.hidden,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
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

  it('should return the target seeded with the hit node’s current name', () => {
    // mock
    const store = createTestStore();
    const frame = addFrame(store);

    getFrameNameLabelRectsMock.mockReturnValue([rectFor(frame.id)]);

    // result
    expect(getFrameNameLabelEditTarget({ x: 100, y: -20 }, store.getState())).toEqual({
      center: { x: 100, y: -20 },
      height: 24,
      nodeId: frame.id,
      value: frame.name,
      width: 60,
    });
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
});
