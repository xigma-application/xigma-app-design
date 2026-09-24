// store
import { addNodes, convertGroupToBoolean, groupNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TRectangleNode, TTextNode } from 'types/design/types';

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

describe('handleConvertGroupToBoolean', () => {
  it('should turn the group itself into a boolean with the same children instead of wrapping it', () => {
    // mock
    const groupId = addGroup(['a', 'b'], [0, 20]);

    // action
    store.dispatch(convertGroupToBoolean({ groupId, operation: BooleanOperation.subtract }));

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({
      booleanOperation: BooleanOperation.subtract,
      childIds: ['a', 'b'],
      name: 'Subtract',
      type: NodeType.boolean,
    });
    expect(selectSelectedIds(store.getState())).toEqual([groupId]);
  });

  it('should leave a group with a child that cannot be a boolean operand unchanged', () => {
    // mock
    const groupId = addGroup(['c', 'd'], [200, 220]);
    const text = {
      content: 'a',
      height: 10,
      id: 'text',
      name: 'text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 10,
      x: 0,
      y: 0,
    };

    store.dispatch(addNodes({ nodes: [text as TTextNode], rootIds: ['text'] }));
    store.dispatch(setSelection(['text', groupId]));
    store.dispatch(groupNodes());

    const outerGroupId = selectSelectedIds(store.getState())[0];

    // action
    store.dispatch(convertGroupToBoolean({ groupId: outerGroupId, operation: BooleanOperation.union }));

    // result
    expect(selectNodes(store.getState())[outerGroupId].type).toBe(NodeType.group);
  });
});
