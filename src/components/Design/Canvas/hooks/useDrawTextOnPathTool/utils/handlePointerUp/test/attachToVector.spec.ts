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
    attachToVector(vectorId, store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[vectorId]).toMatchObject({
      fillColor: null,
      fillColorOverrideByKey: {},
      filledFaceKeys: [],
    });
  });

  it('should select the vector and start text-editing bound to it, offset at the very start of its path', () => {
    // mock
    const vectorId = addStraightVector(6200);

    // before
    attachToVector(vectorId, store.dispatch);

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([vectorId]);
    expect(selectEditingTextBox(store.getState())).toMatchObject({
      pathFlip: false,
      pathId: vectorId,
      pathStartOffset: VECTOR_PATH_START_OFFSET_START,
      rotation: 0,
    });
  });
});
