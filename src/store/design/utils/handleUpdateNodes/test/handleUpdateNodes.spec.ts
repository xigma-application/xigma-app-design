// store
import { addNode, updateNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const addRectangle = (x: number): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleUpdateNodes', () => {
  it('should apply every update in one dispatch', () => {
    // mock
    const idA = addRectangle(0);
    const idB = addRectangle(100);

    // before
    store.dispatch(
      updateNodes([
        { changes: { x: 5, y: 6 }, id: idA },
        { changes: { width: 30 }, id: idB },
      ]),
    );

    // result
    const { nodes } = selectActivePage(store.getState());

    expect(nodes[idA]).toMatchObject({ x: 5, y: 6 });
    expect(nodes[idB]).toMatchObject({ width: 30, x: 100 });
  });

  it('should apply several updates to the same node in order', () => {
    // mock
    const id = addRectangle(0);

    // before
    store.dispatch(
      updateNodes([
        { changes: { x: 10 }, id },
        { changes: { x: 20 }, id },
      ]),
    );

    // result
    expect(selectActivePage(store.getState()).nodes[id]).toMatchObject({ x: 20 });
  });

  it('should ignore an id that is not on the page and leave state alone for an empty list', () => {
    // mock
    const id = addRectangle(0);
    const before = selectActivePage(store.getState()).nodes;

    // before
    store.dispatch(updateNodes([]));
    store.dispatch(updateNodes([{ changes: { x: 9 }, id: 'missing' }]));

    // result
    expect(selectActivePage(store.getState()).nodes[id]).toMatchObject({ x: 0 });
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toEqual(Object.keys(before));
  });
});
