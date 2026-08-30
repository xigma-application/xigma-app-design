// store
import { addNode, groupNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { copySelectedNodes } from '../copySelectedNodes';
import { getClipboardNodes, setClipboardNodes } from '../clipboard';

const addFrameNode = (overrides: { x?: number; y?: number } = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('copySelectedNodes', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    setClipboardNodes([], []);
  });

  it('should copy the selected nodes into the clipboard', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // action
    copySelectedNodes();

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
    copySelectedNodes();

    // result
    const clipboard = getClipboardNodes();
    expect(clipboard.rootIds).toEqual([groupId]);
    expect(clipboard.nodes.map((node) => node.id).sort()).toEqual([a, b, groupId].sort());
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode();

    // action
    copySelectedNodes();

    // result
    expect(getClipboardNodes()).toEqual({ nodes: [], rootIds: [] });
  });

  it('should do nothing while a node is open for vector editing', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    // action
    copySelectedNodes();

    // result
    expect(getClipboardNodes()).toEqual({ nodes: [], rootIds: [] });
  });
});
