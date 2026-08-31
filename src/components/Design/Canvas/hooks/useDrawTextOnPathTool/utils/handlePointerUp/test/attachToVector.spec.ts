// others
import { VECTOR_PATH_START_OFFSET_START } from '../../../../../constants';

// store
import { addNode } from 'store/design/slice';
import { selectActivePage, selectEditingTextBox } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { attachToVector } from '../attachToVector';

const addStraightVector = (offsetX: number): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: ['face-1'],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: offsetX, y: 0 }, b: { id: 'b', x: offsetX + 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('attachToVector', () => {
  it('should strip the vector’s fill so the path itself stays invisible under the text', () => {
    // mock
    const vectorId = addStraightVector(6000);

    // before
    attachToVector(vectorId, { x: 6000, y: 0 }, store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[vectorId]).toMatchObject({
      fillColor: null,
      fillColorOverrideByKey: {},
      filledFaceKeys: [],
    });
  });

  it('should select the vector and start text-editing bound to it, offset at exactly the clicked point', () => {
    // mock — a(6200,0)->b(6300,0); clicking its own start
    const vectorId = addStraightVector(6200);

    // before
    attachToVector(vectorId, { x: 6200, y: 0 }, store.dispatch);

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([vectorId]);
    expect(selectEditingTextBox(store.getState())).toMatchObject({
      pathFlip: false,
      pathId: vectorId,
      pathStartOffset: VECTOR_PATH_START_OFFSET_START,
      rotation: 0,
    });
  });

  it('should start reading from wherever the user actually clicked on the path, not always its own start', () => {
    // mock — a(6400,0)->b(6500,0), a 100-unit-long straight chain
    const vectorId = addStraightVector(6400);

    // before — clicked at its own midpoint
    attachToVector(vectorId, { x: 6450, y: 0 }, store.dispatch);

    // result — offset is a 0..1 fraction of the chain's total length
    expect(selectEditingTextBox(store.getState())?.pathStartOffset).toBeCloseTo(0.5, 5);
  });

  it('should fall back to the chain start for a degenerate (zero-length) vector instead of dividing by zero', () => {
    // mock — a and b coincide, so the chain has no meaningful length to project a click onto
    store.dispatch(
      addNode({
        fillColor: '#ff0000',
        filledFaceKeys: ['face-1'],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 6600, y: 0 }, b: { id: 'b', x: 6600, y: 0 } },
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const vectorId = rootOrder[rootOrder.length - 1];

    // before
    attachToVector(vectorId, { x: 6600, y: 0 }, store.dispatch);

    // result
    expect(selectEditingTextBox(store.getState())?.pathStartOffset).toBe(VECTOR_PATH_START_OFFSET_START);
  });
});
