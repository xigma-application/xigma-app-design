// store
import { addNodes, booleanNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

const makeRectangle = (id: string, parentId: string | null, x: number): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x,
  y: 0,
});

const frame: TFrameNode = {
  childIds: ['perParentInner'],
  clipContent: true,
  fills: [],
  height: 100,
  id: 'perParentFrame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 200,
  y: 0,
};

describe('handleBooleanSelection', () => {
  it('should make one boolean per parent for rectangles from different parents and select them all', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [frame, makeRectangle('perParentInner', 'perParentFrame', 210), makeRectangle('perParentRoot', null, 0)],
        rootIds: ['perParentFrame', 'perParentRoot'],
      }),
    );
    store.dispatch(setSelection(['perParentInner', 'perParentRoot']));

    // action
    store.dispatch(booleanNodes(BooleanOperation.union));

    // result
    const { nodes, selectedIds } = selectActivePage(store.getState());
    const booleans = selectedIds.map((id) => nodes[id]);

    expect(booleans.map((node) => node.type)).toEqual([NodeType.boolean, NodeType.boolean]);
    expect(nodes.perParentInner.parentId).not.toBe(nodes.perParentRoot.parentId);
    expect(nodes[nodes.perParentInner.parentId as string].parentId).toBe('perParentFrame');
    expect(nodes[nodes.perParentRoot.parentId as string].parentId).toBeNull();
  });
});
