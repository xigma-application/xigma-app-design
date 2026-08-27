// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds, startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { handleEnterTextEdit } from '../handleEnterTextEdit';

const mockEvent = (): KeyboardEvent => new KeyboardEvent('keydown', { code: 'Enter' });

const addTextNode = (pathId: string | null = null): string => {
  store.dispatch(
    addNode({
      content: 'Hello',
      fill: '#000000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 16,
      height: 20,
      name: 'Text',
      parentId: null,
      pathId,
      rotation: 0,
      type: NodeType.text,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('handleEnterTextEdit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(stopTextEdit());
  });

  it('should enter caret editing for a single selected plain text node', () => {
    // mock
    const textId = addTextNode();

    store.dispatch(setSelection([textId]));

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toMatchObject({ pathId: null, x: 0, y: 0 });
    expect(store.getState().design.editingNodeId).toBe(textId);
  });

  it('should prevent the native default action, so the same Enter keypress cannot also insert a line break once the caret overlay grabs focus', () => {
    // mock
    const textId = addTextNode();
    const event = mockEvent();

    store.dispatch(setSelection([textId]));

    // spy
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // action
    handleEnterTextEdit(event, store.dispatch);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not prevent the default action when it does nothing (no eligible text node selected)', () => {
    // mock
    const rectangleId = addRectangleNode();
    const event = mockEvent();

    store.dispatch(setSelection([rectangleId]));

    // spy
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // action
    handleEnterTextEdit(event, store.dispatch);

    // result
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should enter caret editing for a single selected text-on-path node, carrying its pathId', () => {
    // mock
    const textId = addTextNode('path-1');

    store.dispatch(setSelection([textId]));

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toMatchObject({ pathId: 'path-1' });
  });

  it('should do nothing when the selected node is not text', () => {
    // mock
    const rectangleId = addRectangleNode();

    store.dispatch(setSelection([rectangleId]));

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should do nothing when nothing is selected', () => {
    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should do nothing when more than one node is selected', () => {
    // mock
    const textIdA = addTextNode();
    const textIdB = addTextNode();

    store.dispatch(setSelection([textIdA, textIdB]));

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should do nothing while a different tool than the selection/move tool is active', () => {
    // mock
    const textId = addTextNode();

    store.dispatch(setSelection([textId]));
    store.dispatch(setActiveTool(ToolName.hand));

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const textId = addTextNode();

    store.dispatch(setSelection([textId]));
    store.dispatch(setVectorEditingNodeIds(['some-vector-id']));

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should do nothing when already editing a text node', () => {
    // mock
    const textId = addTextNode();

    store.dispatch(setSelection([textId]));
    store.dispatch(
      startTextEdit({
        box: {
          flipX: false,
          flipY: false,
          height: 20,
          pathFlip: undefined,
          pathId: null,
          pathStartOffset: undefined,
          rotation: 0,
          width: 100,
          x: 0,
          y: 0,
        },
        content: 'Hello',
        id: textId,
      }),
    );

    // action
    handleEnterTextEdit(mockEvent(), store.dispatch);

    // result
    expect(store.getState().design.editingNodeId).toBe(textId);
  });
});
