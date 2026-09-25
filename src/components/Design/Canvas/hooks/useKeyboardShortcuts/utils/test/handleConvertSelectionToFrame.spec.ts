// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleConvertSelectionToFrame } from '../handleConvertSelectionToFrame';

const addSectionNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
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
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

describe('handleConvertSelectionToFrame', () => {
  it('should convert the selected section into a frame, keeping its id, position and slot in rootOrder', () => {
    // mock
    const sectionId = addSectionNode();
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    store.dispatch(setSelection([sectionId]));

    // action
    handleConvertSelectionToFrame(store.dispatch);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[sectionId]).toMatchObject({ childIds: [], clipContent: true, id: sectionId, type: NodeType.frame, x: 5, y: 5 });
    expect(page.rootOrder).toEqual(rootOrderBefore);
  });

  it('should convert every selected section', () => {
    // mock
    const sectionA = addSectionNode();
    const sectionB = addSectionNode();
    store.dispatch(setSelection([sectionA, sectionB]));

    // action
    handleConvertSelectionToFrame(store.dispatch);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[sectionA].type).toBe(NodeType.frame);
    expect(page.nodes[sectionB].type).toBe(NodeType.frame);
  });

  it('should convert nothing when the selection also holds a node that is not a section', () => {
    // mock
    const sectionId = addSectionNode();
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([sectionId, rectangleId]));

    // action
    handleConvertSelectionToFrame(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[sectionId].type).toBe(NodeType.section);
  });

  it('should convert nothing when a selected section holds another section', () => {
    // mock
    const innerId = addSectionNode();
    const outerId = addSectionNode();
    const plainId = addSectionNode();
    store.dispatch(moveNodes({ nodeIds: [innerId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(setSelection([outerId, plainId]));

    // action
    handleConvertSelectionToFrame(store.dispatch);

    // result
    const { nodes } = selectActivePage(store.getState());

    expect(nodes[outerId].type).toBe(NodeType.section);
    expect(nodes[plainId].type).toBe(NodeType.section);
  });

  it('should do nothing when nothing selected is a section', () => {
    // mock
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([rectangleId]));

    // action
    handleConvertSelectionToFrame(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[rectangleId].type).toBe(NodeType.rectangle);
  });

  it('should be undoable as a single step even though it converts multiple sections', () => {
    // mock
    const sectionA = addSectionNode();
    const sectionB = addSectionNode();
    store.dispatch(setSelection([sectionA, sectionB]));
    const before = selectActivePage(store.getState()).nodes;

    // action
    handleConvertSelectionToFrame(store.dispatch);
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual(before);
  });
});
