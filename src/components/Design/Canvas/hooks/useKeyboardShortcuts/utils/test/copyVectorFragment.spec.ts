// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { copyVectorFragment } from '../copyVectorFragment';
import { getVectorClipboardFragment, setVectorClipboardFragment } from '../vectorClipboard';

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('copyVectorFragment', () => {
  beforeEach(() => {
    setVectorClipboardFragment({ filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [] });
  });

  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should store the selected segment and its endpoints into the vector clipboard', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    // action
    copyVectorFragment(store.getState().design.pages[store.getState().design.activePageId].nodes, [vectorId], [], ['s1']);

    // result
    const fragment = getVectorClipboardFragment();

    expect(fragment?.vertices).toHaveLength(2);
    expect(fragment?.segments).toHaveLength(1);
  });
});
