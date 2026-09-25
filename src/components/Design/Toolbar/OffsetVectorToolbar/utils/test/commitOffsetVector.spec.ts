// store
import { addNode, setOffsetVector, setSelection } from 'store/design/slice';
import { selectActivePage, selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';

// utils
import { commitOffsetVector } from '../commitOffsetVector';

const addLine = (parentId: string | null = null): string => {
  const { payload } = store.dispatch(
    addNode({ height: 0, name: 'Line', parentId, rotation: 0, strokes: [], type: NodeType.line, width: 50, x: 0, y: 0 }),
  );

  return payload.id;
};

describe('commitOffsetVector', () => {
  it('should turn the line into its offset vector in place, keep it selected and leave the offset mode in one undo step', () => {
    // mock
    const lineId = addLine();
    const orderBefore = selectActivePage(store.getState()).rootOrder;
    store.dispatch(setOffsetVector({ distance: 5, join: StrokeJoin.miter, nodeId: lineId }));

    // action
    commitOffsetVector(store.dispatch);

    // result
    const { nodes, rootOrder, selectedIds } = selectActivePage(store.getState());

    expect(nodes[lineId].type).toBe(NodeType.vector);
    expect(rootOrder).toEqual(orderBefore);
    expect(selectedIds).toEqual([lineId]);
    expect(selectOffsetVector(store.getState())).toBeNull();

    // action
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).nodes[lineId].type).toBe(NodeType.line);
  });

  it('should only leave the offset mode when its line is gone', () => {
    // mock
    store.dispatch(setSelection([]));
    const before = selectActivePage(store.getState()).nodes;
    store.dispatch(setOffsetVector({ distance: 5, join: StrokeJoin.miter, nodeId: 'missing' }));

    // action
    commitOffsetVector(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes).toBe(before);
    expect(selectOffsetVector(store.getState())).toBeNull();
  });

  it('should do nothing outside the offset mode', () => {
    // mock
    store.dispatch(setOffsetVector(null));
    const before = selectActivePage(store.getState()).nodes;

    // action
    commitOffsetVector(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes).toBe(before);
  });

  it('should turn a polygon into its filled offset vector', () => {
    // mock
    const { payload } = store.dispatch(
      addNode({
        fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
        flipX: false,
        flipY: false,
        height: 50,
        name: 'Polygon',
        parentId: null,
        rotation: 0,
        sides: 3,
        type: NodeType.polygon,
        width: 50,
        x: 0,
        y: 0,
      }),
    );
    store.dispatch(setOffsetVector({ distance: 5, join: StrokeJoin.round, nodeId: payload.id }));

    // action
    commitOffsetVector(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[payload.id]).toMatchObject({
      defaultFill: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
      type: NodeType.vector,
    });
  });
});
