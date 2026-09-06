// store
import { addNode, deleteNode, groupNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { pinRotatedGroupBounds } from '../pinRotatedGroupBounds';

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 20, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

describe('pinRotatedGroupBounds', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should re-pin a rotated group’s own height/width back to its captured origin', () => {
    // mock
    const rectId = addRect(0, 0);

    store.dispatch(setSelection([rectId]));
    store.dispatch(groupNodes());

    const [groupId] = selectActivePage(store.getState()).selectedIds;
    const group = selectActivePage(store.getState()).nodes[groupId] as { height: number; width: number };

    // mock — the group's bounds drifted (e.g. floating-point rounding from a rigid rotate)
    store.dispatch(updateNode({ changes: { height: group.height + 5, width: group.width + 5 }, id: groupId }));

    // action
    pinRotatedGroupBounds(store.dispatch, { [groupId]: { height: group.height, rotation: 0, width: group.width, x: 0, y: 0 } });

    // result
    expect(selectActivePage(store.getState()).nodes[groupId]).toMatchObject({ height: group.height, width: group.width });
  });

  it('should leave a non-group node’s size untouched', () => {
    // mock
    const rectId = addRect(0, 0);

    // action
    pinRotatedGroupBounds(store.dispatch, { [rectId]: { height: 999, rotation: 0, width: 999, x: 0, y: 0 } });

    // result
    expect(selectActivePage(store.getState()).nodes[rectId]).toMatchObject({ height: 20, width: 20 });
  });

  it('should skip an origin without a width (line/vector origins)', () => {
    // mock
    const rectId = addRect(0, 0);

    // action / result — must not throw when the origin shape has no width to re-pin
    expect(() => pinRotatedGroupBounds(store.dispatch, { [rectId]: { x1: 0, x2: 10, y1: 0, y2: 0 } })).not.toThrow();
  });
});
