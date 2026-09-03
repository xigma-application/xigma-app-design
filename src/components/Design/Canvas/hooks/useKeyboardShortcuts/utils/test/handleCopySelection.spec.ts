// store
import { addNode, groupNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { getClipboardNodes, setClipboardNodes } from '../clipboard';
import { getVectorClipboardFragment, setVectorClipboardFragment } from '../vectorClipboard';
import { handleCopySelection } from '../handleCopySelection';

const addFrameNode = (overrides: { x?: number; y?: number } = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleCopySelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    setClipboardNodes([], []);
    setVectorClipboardFragment({ filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [] });
  });

  it('should copy the selected nodes into the clipboard', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // action
    handleCopySelection(createCanvasRefs());

    // result
    expect(getClipboardNodes().nodes.map((node) => node.id)).toEqual([frameId]);
    expect(getClipboardNodes().rootIds).toEqual([frameId]);
  });

  it('should copy a group together with all of its children, not just the group node itself', () => {
    // mock
    const a = addFrameNode({ x: 0, y: 0 });
    const b = addFrameNode({ x: 40, y: 0 });

    store.dispatch(setSelection([a, b]));
    store.dispatch(groupNodes());

    const page = selectActivePage(store.getState());
    const [groupId] = page.selectedIds;

    // action
    handleCopySelection(createCanvasRefs());

    // result
    const clipboard = getClipboardNodes();
    expect(clipboard.rootIds).toEqual([groupId]);
    expect(clipboard.nodes.map((node) => node.id).sort()).toEqual([a, b, groupId].sort());
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode();

    // action
    handleCopySelection(createCanvasRefs());

    // result
    expect(getClipboardNodes()).toEqual({ nodes: [], rootIds: [] });
  });

  it('should do nothing while a vector node is open for editing with no vertex/segment selected', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    // action
    handleCopySelection(createCanvasRefs());

    // result
    expect(getClipboardNodes()).toEqual({ nodes: [], rootIds: [] });
  });

  it('should copy the selected vertex into the vector clipboard while a vector node is open for editing', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    // action
    handleCopySelection(refs);

    // result
    expect(getVectorClipboardFragment()?.vertices).toEqual([{ id: 'v1', x: 0, y: 0 }]);
  });
});
