// store
import { addNodes, groupNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { scaleGroupLikeNode } from '../scaleGroupLikeNode';

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 0,
});

describe('scaleGroupLikeNode', () => {
  it('should scale every child of the group from its top left corner', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('scaleA', 0), makeRectangle('scaleB', 60)], rootIds: ['scaleA', 'scaleB'] }));
    store.dispatch(setSelection(['scaleA', 'scaleB']));
    store.dispatch(groupNodes());
    const [groupId] = selectSelectedIds(store.getState());

    // action
    scaleGroupLikeNode(store.dispatch, groupId, { height: 80, width: 200 });

    // result
    const nodes = selectNodes(store.getState());
    expect(nodes.scaleA).toMatchObject({ height: 80, width: 80, x: 0 });
    expect(nodes.scaleB).toMatchObject({ height: 80, width: 80, x: 120 });
  });

  it('should do nothing for a node that is not a group', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('notGroup', 1000)], rootIds: ['notGroup'] }));

    // action
    scaleGroupLikeNode(store.dispatch, 'notGroup', { height: 80, width: 80 });

    // result
    expect(selectNodes(store.getState()).notGroup).toMatchObject({ height: 40, width: 40 });
  });
});
