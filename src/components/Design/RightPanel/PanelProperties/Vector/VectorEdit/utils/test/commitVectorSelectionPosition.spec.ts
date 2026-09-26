// store
import { addNode, addNodes, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorSelectionPosition } from '../commitVectorSelectionPosition';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

const readVector = (id: string): TVectorNode => selectActivePage(store.getState()).nodes[id] as TVectorNode;

describe('commitVectorSelectionPosition', () => {
  it('should move the selected points of every vector together to the new value', () => {
    // mock
    const first = { ...curve, id: 'first' };
    const second = makeNetworkVector({ d: { x: 300, y: 50 } }, [], { id: 'second' });

    store.dispatch(addNodes({ nodes: [first, second], rootIds: [first.id, second.id] }));

    // before
    commitVectorSelectionPosition(
      store.dispatch,
      [
        { handles: [], node: first, pointIds: ['c'], vertexIds: ['c'] },
        { handles: [], node: second, pointIds: ['d'], vertexIds: ['d'] },
      ],
      'x',
      150,
    );

    // result
    expect(readVector('first').vertices.c).toEqual({ id: 'c', x: 150, y: 100 });
    expect(readVector('second').vertices.d).toEqual({ id: 'd', x: 350, y: 50 });
  });

  it('should move the selected handle ends to the new value, relative to the parent frame', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [],
        height: 200,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 200,
        x: -10,
        y: -10,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const frameId = rootOrder[rootOrder.length - 1];
    const framed = { ...curve, id: 'framed' };

    store.dispatch(addNodes({ nodes: [framed], rootIds: [framed.id] }));
    store.dispatch(moveNodes({ nodeIds: [framed.id], targetIndex: 0, targetParentId: frameId }));

    // before
    commitVectorSelectionPosition(
      store.dispatch,
      [{ handles: [{ end: 'start', segmentId: 's0' }], node: readVector(framed.id), pointIds: ['a'], vertexIds: [] }],
      'y',
      0,
    );

    // result
    expect(readVector(framed.id).segments.s0.tangentStart).toEqual({ x: 30, y: -10 });
  });
});
