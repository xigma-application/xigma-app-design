// store
import { addNode, addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TVectorNode } from 'types/design/types';

// utils
import { commitDimensionNodeSize } from '../commitDimensionNodeSize';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('commitDimensionNodeSize', () => {
  it('should resize a vector, keeping its ratio when it is locked', () => {
    // mock
    const vector = makeSquareVector({ id: 'dimension-vector', lockedAspectRatio: true });

    store.dispatch(addNodes({ nodes: [vector], rootIds: [vector.id] }));

    // before
    commitDimensionNodeSize(store.dispatch, vector, 'width', 50);

    // result
    const bounds = getVectorNodeBounds(selectActivePage(store.getState()).nodes[vector.id] as TVectorNode);

    expect({ height: bounds.height, width: bounds.width }).toEqual({ height: 50, width: 50 });
  });

  it('should resize an unlocked vector along one axis only', () => {
    // mock
    const vector = makeSquareVector({ id: 'free-dimension-vector' });

    store.dispatch(addNodes({ nodes: [vector], rootIds: [vector.id] }));

    // before
    commitDimensionNodeSize(store.dispatch, vector, 'height', 40);

    // result
    const bounds = getVectorNodeBounds(selectActivePage(store.getState()).nodes[vector.id] as TVectorNode);

    expect({ height: bounds.height, width: bounds.width }).toEqual({ height: 40, width: 100 });
  });

  it('should resize a box node', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [],
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const { nodes, rootOrder } = selectActivePage(store.getState());
    const rectangle = nodes[rootOrder[rootOrder.length - 1]] as TBoxSceneNode;

    // before
    commitDimensionNodeSize(store.dispatch, rectangle, 'height', 30);

    // result
    expect(selectActivePage(store.getState()).nodes[rectangle.id]).toMatchObject({ height: 30, width: 10 });
  });
});
