// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { reparentDuplicatedRoots } from '../reparentDuplicatedRoots';

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 20,
      name: 'F',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRect = (): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 10, name: 'R', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const withParent = (parentId: string | null): TSceneNode => ({ parentId }) as TSceneNode;

describe('reparentDuplicatedRoots', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should move each duplicated root under the same parent as its original, right after it', () => {
    // mock
    const dispatch = vi.fn();
    const parentId = addFrame();
    const firstChild = addRect();
    const secondChild = addRect();

    store.dispatch(moveNodes({ nodeIds: [firstChild, secondChild], targetIndex: 0, targetParentId: parentId }));
    const originalNodes = selectActivePage(store.getState()).nodes;

    // action
    reparentDuplicatedRoots(dispatch, originalNodes, [firstChild, secondChild], ['dup-1', 'dup-2']);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, moveNodes({ nodeIds: ['dup-1'], targetIndex: 1, targetParentId: parentId }));
    expect(dispatch).toHaveBeenNthCalledWith(2, moveNodes({ nodeIds: ['dup-2'], targetIndex: 2, targetParentId: parentId }));
  });

  it('should leave a duplicated root at the tree root when its original had no parent', () => {
    // mock
    const dispatch = vi.fn();

    // action
    reparentDuplicatedRoots(dispatch, { top: withParent(null) }, ['top'], ['dup-top']);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should leave a duplicated root alone when the recorded parent no longer resolves to a node', () => {
    // mock
    const dispatch = vi.fn();

    // action
    reparentDuplicatedRoots(dispatch, { orphan: withParent('deleted-parent') }, ['orphan'], ['dup-orphan']);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should leave a duplicated root alone when the recorded parent is not a container', () => {
    // mock
    const dispatch = vi.fn();
    const rectId = addRect();

    // action
    reparentDuplicatedRoots(dispatch, { child: withParent(rectId) }, ['child'], ['dup-child']);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
