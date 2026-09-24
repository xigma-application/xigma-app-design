// others
import { DEFAULT_MASK_GROUP_NAME } from '../../../constants';

// store
import { addNodes, convertGroupToMask, groupNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 10,
});

const addGroup = (ids: string[], xs: number[]): string => {
  store.dispatch(addNodes({ nodes: ids.map((id, index) => makeRectangle(id, xs[index])), rootIds: ids }));
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return selectSelectedIds(store.getState())[0];
};

describe('handleConvertGroupToMask', () => {
  it('should turn the group itself into a mask group with the same children and select the mask', () => {
    // mock
    const groupId = addGroup(['a', 'b'], [0, 20]);

    // action
    store.dispatch(convertGroupToMask(groupId));

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({
      childIds: ['a', 'b'],
      name: DEFAULT_MASK_GROUP_NAME,
      type: NodeType.mask,
    });
    expect(selectSelectedIds(store.getState())).toEqual(['b']);
  });

  it('should leave a node that is not a group unchanged', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeRectangle('single', 300)], rootIds: ['single'] }));

    // action
    store.dispatch(convertGroupToMask('single'));

    // result
    expect(selectNodes(store.getState()).single.type).toBe(NodeType.rectangle);
  });
});
