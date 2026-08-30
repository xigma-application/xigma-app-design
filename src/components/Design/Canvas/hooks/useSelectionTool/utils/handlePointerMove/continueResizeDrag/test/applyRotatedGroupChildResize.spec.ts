// store
import { addNode, groupNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyRotatedGroupChildResize } from '../applyRotatedGroupChildResize';

describe('applyRotatedGroupChildResize', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should dispatch scaled changes for every child origin when the group resolves to a box node', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#00ff00', height: 20, name: 'B', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 60, y: 0 }),
    );

    const childIds = selectActivePage(store.getState()).rootOrder.slice(-2);

    store.dispatch(setSelection(childIds));
    store.dispatch(groupNodes());

    const [groupId] = selectSelectedIds(store.getState());

    store.dispatch(updateNode({ changes: { height: 20, width: 160, x: 0, y: 0 }, id: groupId }));

    // before
    applyRotatedGroupChildResize(
      groupId,
      { flip: null, height: 20, rotation: 0, width: 80, x: 0, y: 0 },
      { [childIds[0]]: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } },
      store.dispatch,
    );

    // result
    const child = selectActivePage(store.getState()).nodes[childIds[0]] as TRectangleNode;
    expect(child.width).toBe(40);
  });

  it('should do nothing when the group id no longer resolves to a node', () => {
    // before / result
    expect(() =>
      applyRotatedGroupChildResize(
        'missing',
        { flip: null, height: 20, rotation: 0, width: 80, x: 0, y: 0 },
        { a: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } },
        store.dispatch,
      ),
    ).not.toThrow();
  });

  it('should do nothing when the group origin has no width (a vector origin, never actually a group)', () => {
    // before / result
    expect(() =>
      applyRotatedGroupChildResize(
        'group-1',
        { rotation: 0, segments: {}, vertices: {} },
        { a: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } },
        store.dispatch,
      ),
    ).not.toThrow();
  });
});
