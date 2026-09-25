// store
import { addNodes } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { handleToggleNodesFlag } from '../handleToggleNodesFlag';

const makeRectangle = (id: string, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [makeRectangle('flagVisible'), makeRectangle('flagHidden', { hidden: true }), makeRectangle('flagLocked', { locked: true })],
      rootIds: ['flagVisible', 'flagHidden', 'flagLocked'],
    }),
  );
});

describe('handleToggleNodesFlag', () => {
  it('should hide every node when some of them are visible, skipping a missing id', () => {
    // action
    handleToggleNodesFlag(store.dispatch, ['flagVisible', 'flagHidden', 'missing'], 'hidden');

    // result
    expect(selectNodes(store.getState()).flagVisible.hidden).toBe(true);
    expect(selectNodes(store.getState()).flagHidden.hidden).toBe(true);
  });

  it('should show every node when all of them are hidden', () => {
    // action
    handleToggleNodesFlag(store.dispatch, ['flagVisible', 'flagHidden'], 'hidden');

    // result
    expect(selectNodes(store.getState()).flagVisible.hidden).toBe(false);
    expect(selectNodes(store.getState()).flagHidden.hidden).toBe(false);
  });

  it('should lock every node in one undo step', () => {
    // mock
    const before = selectNodes(store.getState());

    // action
    handleToggleNodesFlag(store.dispatch, ['flagVisible', 'flagLocked'], 'locked');

    // result
    expect(selectNodes(store.getState()).flagVisible.locked).toBe(true);
    expect(selectNodes(store.getState()).flagLocked.locked).toBe(true);

    // action
    store.dispatch(undo());

    // result
    expect(selectNodes(store.getState())).toEqual(before);
  });
});
