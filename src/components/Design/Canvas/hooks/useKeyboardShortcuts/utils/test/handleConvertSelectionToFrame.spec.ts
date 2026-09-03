// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleConvertSelectionToFrame } from '../handleConvertSelectionToFrame';

const addSectionNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Section', parentId: null, rotation: 0, type: NodeType.section, width: 20, x: 5, y: 5 }),
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

    expect(page.nodes[sectionId]).toMatchObject({ id: sectionId, childIds: [], clipContent: true, type: NodeType.frame, x: 5, y: 5 });
    expect(page.rootOrder).toEqual(rootOrderBefore);
  });

  it('should convert every selected section while ignoring any other selected node type', () => {
    // mock
    const sectionA = addSectionNode();
    const sectionB = addSectionNode();
    const rectangleId = addRectangleNode();
    store.dispatch(setSelection([sectionA, sectionB, rectangleId]));

    // action
    handleConvertSelectionToFrame(store.dispatch);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[sectionA].type).toBe(NodeType.frame);
    expect(page.nodes[sectionB].type).toBe(NodeType.frame);
    expect(page.nodes[rectangleId].type).toBe(NodeType.rectangle);
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
