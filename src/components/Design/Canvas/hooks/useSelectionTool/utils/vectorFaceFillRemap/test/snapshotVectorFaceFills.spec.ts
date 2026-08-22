// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { snapshotVectorFaceFills } from '../snapshotVectorFaceFills';

const addVectorNode = (filledFaceKeys: string[]): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('snapshotVectorFaceFills', () => {
  it('should return an empty snapshot when no vector node in the document has any fill', () => {
    // mock
    addVectorNode([]);

    // before
    const snapshot = snapshotVectorFaceFills(store.getState());

    // result
    expect(snapshot).toEqual({});
  });

  it('should include only vector nodes that have at least one filled face', () => {
    // mock
    const filledId = addVectorNode(['a,b,c']);

    addVectorNode([]);

    // before
    const snapshot = snapshotVectorFaceFills(store.getState());

    // result
    expect(Object.keys(snapshot)).toEqual([filledId]);
    expect(snapshot[filledId].filledFaceKeys).toEqual(['a,b,c']);
  });
});
