// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleConvertSelectionToSection } from '../handleConvertSelectionToSection';

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
      x: 5,
      y: 5,
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
      x: 5,
      y: 5,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleConvertSelectionToSection', () => {
  it('should convert the selected frame into a section, keeping its id, position and slot in rootOrder', () => {
    // mock
    const frameId = addFrameNode();
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    store.dispatch(setSelection([frameId]));

    // action
    handleConvertSelectionToSection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[frameId]).toMatchObject({ id: frameId, type: NodeType.section, x: 5, y: 5 });
    expect(page.rootOrder).toEqual(rootOrderBefore);
  });

  it('should convert every selected frame while ignoring any other selected node type', () => {
    // mock
    const frameA = addFrameNode();
    const frameB = addFrameNode();
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([frameA, frameB, rectangleId]));

    // action
    handleConvertSelectionToSection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[frameA].type).toBe(NodeType.section);
    expect(page.nodes[frameB].type).toBe(NodeType.section);
    expect(page.nodes[rectangleId].type).toBe(NodeType.rectangle);
  });

  it('should do nothing when nothing selected is a frame', () => {
    // mock
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([rectangleId]));

    // action
    handleConvertSelectionToSection(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[rectangleId].type).toBe(NodeType.rectangle);
  });

  it('should keep the frame’s children in place instead of evicting them to root, since a section can hold children too', () => {
    // mock
    const frameId = addFrameNode();
    const childId = addRectangleNode();
    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([frameId]));

    // action
    handleConvertSelectionToSection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[frameId]).toMatchObject({ childIds: [childId], type: NodeType.section });
    expect(page.nodes[childId].parentId).toBe(frameId);
    expect(page.rootOrder).not.toContain(childId);
  });

  it('should be undoable as a single step even though it converts multiple frames', () => {
    // mock
    const frameA = addFrameNode();
    const frameB = addFrameNode();
    store.dispatch(setSelection([frameA, frameB]));
    const before = selectActivePage(store.getState()).nodes;

    // action
    handleConvertSelectionToSection(store.dispatch);
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual(before);
  });
});
