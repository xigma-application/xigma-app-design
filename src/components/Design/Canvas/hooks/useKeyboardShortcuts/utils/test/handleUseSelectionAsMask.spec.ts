// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleUseSelectionAsMask } from '../handleUseSelectionAsMask';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addSectionNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      fill: '#ff0000',
      height: 20,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleUseSelectionAsMask', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should wrap the current selection into a mask group', () => {
    // mock
    const idA = addRectangleNode();
    const idB = addRectangleNode();

    store.dispatch(setSelection([idA, idB]));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    const [groupId] = page.rootOrder;
    const [maskChildId] = selectSelectedIds(store.getState());
    expect(page.nodes[groupId].type).toBe(NodeType.mask);
    expect(page.nodes[groupId].name).toBe('Mask group');
    expect(maskChildId).toBe(idB);
  });

  it('should mask a single selected node', () => {
    // mock
    const idA = addRectangleNode();

    store.dispatch(setSelection([idA]));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    const [groupId] = page.rootOrder;
    expect(page.nodes[groupId].type).toBe(NodeType.mask);
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });

  it('should remove the mask when the single selected node is already the current mask', () => {
    // mock — build a mask container directly, matching what "wrap into a mask group" produces
    const idA = addRectangleNode();
    store.dispatch(setSelection([idA]));
    handleUseSelectionAsMask(store.dispatch);
    const [maskChildId] = selectSelectedIds(store.getState());
    const maskId = selectActivePage(store.getState()).nodes[maskChildId].parentId as string;

    store.dispatch(setSelection([maskChildId]));

    // action — press the shortcut again on the current mask child
    handleUseSelectionAsMask(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[maskId].type).toBe(NodeType.group);
    expect(selectSelectedIds(store.getState())).toEqual([maskChildId]);
  });

  it('should do nothing while in vector editing mode', () => {
    // mock
    const idA = addRectangleNode();
    const idB = addRectangleNode();

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(setVectorEditingNodeIds(['whatever']));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);

    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when every selected node is a frame', () => {
    // mock
    const idA = addFrameNode();
    const idB = addFrameNode();
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;

    store.dispatch(setSelection([idA, idB]));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result — frames stay frames, no group created
    const page = selectActivePage(store.getState());
    expect(page.nodes[idA].type).toBe(NodeType.frame);
    expect(page.nodes[idB].type).toBe(NodeType.frame);
    expect(page.rootOrder).toEqual(rootOrderBefore);
  });

  it('should do nothing when every selected node is a section', () => {
    // mock
    const idA = addSectionNode();
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;

    store.dispatch(setSelection([idA]));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[idA].type).toBe(NodeType.section);
    expect(page.rootOrder).toEqual(rootOrderBefore);
  });

  it('should still mask when the selection mixes a frame with a plain node', () => {
    // mock
    const frameId = addFrameNode();
    const rectId = addRectangleNode();

    store.dispatch(setSelection([frameId, rectId]));

    // action
    handleUseSelectionAsMask(store.dispatch);

    // result — the frame isn't excluded from the group itself, only from the all-container skip
    const page = selectActivePage(store.getState());
    const [groupId] = page.rootOrder;
    expect(page.nodes[groupId].type).toBe(NodeType.mask);
  });
});
