// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

const { getTextFlattenVector } = vi.hoisted(() => ({ getTextFlattenVector: vi.fn() }));

vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({ getTextFlattenVector }));

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handleFlattenSelection } from '../handleFlattenSelection';

const buildFlattenedVector = (): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [],
  id: 'flattened',
  name: 'Text',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
});

describe('handleFlattenSelection', () => {
  beforeEach(() => {
    getTextFlattenVector.mockReset().mockResolvedValue(null);
  });

  it('should replace a selected text node with its flattened vector outline, keeping its id', async () => {
    // mock
    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 40,
        name: 'Text',
        parentId: null,
        rotation: 0,
        type: NodeType.text,
        width: 200,
        x: 0,
        y: 0,
      }),
    );
    const [textId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([textId]));

    getTextFlattenVector.mockResolvedValue(buildFlattenedVector());

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[textId].type).toBe(NodeType.vector);
    expect(page.nodes[textId].id).toBe(textId);
  });

  it('should replace text bound to a path with its flattened outline and delete the now-orphaned path vector, matching Figma', async () => {
    // mock — a simple straight vector path the text is attached to via pathId
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Path',
        parentId: null,
        rotation: 0,
        segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 200, y: 0 } },
      }),
    );
    const [pathId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 40,
        name: 'Text',
        parentId: null,
        pathId,
        rotation: 0,
        type: NodeType.text,
        width: 200,
        x: 0,
        y: 0,
      }),
    );
    const [textId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([textId]));

    getTextFlattenVector.mockResolvedValue(buildFlattenedVector());

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[textId].type).toBe(NodeType.vector);
    expect(page.nodes[pathId]).toBeUndefined();
    expect(page.rootOrder).not.toContain(pathId);
  });

  it('should do nothing when the selection has no node convertible to a vector', async () => {
    // mock
    store.dispatch(setSelection([]));

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([]);
  });

  it('should replace a convertible shape with its vector equivalent, keeping its id', async () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 0, y: 0 }),
    );
    const [rectId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([rectId]));

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    expect(page.nodes[rectId].type).toBe(NodeType.vector);
    expect(page.nodes[rectId].id).toBe(rectId);
  });
});
