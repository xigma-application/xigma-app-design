// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TRectangleNode, TVectorNode } from 'types/design/types';

const { getTextFlattenVector } = vi.hoisted(() => ({ getTextFlattenVector: vi.fn() }));

vi.mock('utils/canvas/text/fontOutline/getTextFlattenVector', () => ({ getTextFlattenVector }));

// store
import { addNode, addNodes, booleanNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handleFlattenSelection } from '../handleFlattenSelection';

const buildRectangle = (id: string, x: number, color: string): TRectangleNode => ({
  fills: [{ color, opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 0,
});

const buildFlattenedVector = (): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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
        defaultFill: null,
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
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 20,
        name: 'Rect',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
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

  it('should replace a boolean with a vector of its result and drop its children', async () => {
    // mock
    store.dispatch(
      addNodes({ nodes: [buildRectangle('boolA', 0, '#ff0000'), buildRectangle('boolB', 20, '#00ff00')], rootIds: ['boolA', 'boolB'] }),
    );
    store.dispatch(setSelection(['boolA', 'boolB']));
    store.dispatch(booleanNodes(BooleanOperation.union));

    const [booleanId] = selectActivePage(store.getState()).selectedIds;

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    const vector = page.nodes[booleanId] as TVectorNode;

    expect(vector.type).toBe(NodeType.vector);
    expect(vector.filledFaceKeys).toHaveLength(1);
    expect(Object.keys(vector.segments)).toHaveLength(8);
    expect(page.nodes.boolA).toBeUndefined();
    expect(page.nodes.boolB).toBeUndefined();
  });

  it('should merge several selected shapes into one vector at the top layer, styled like it', async () => {
    // mock
    store.dispatch(
      addNodes({ nodes: [buildRectangle('mergeA', 0, '#ff0000'), buildRectangle('mergeB', 20, '#00ff00')], rootIds: ['mergeA', 'mergeB'] }),
    );
    store.dispatch(setSelection(['mergeB', 'mergeA']));

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    const vector = page.nodes.mergeB as TVectorNode;

    expect(page.nodes.mergeA).toBeUndefined();
    expect(vector.type).toBe(NodeType.vector);
    expect(Object.keys(vector.segments)).toHaveLength(10);
    expect(vector.filledFaceKeys).toHaveLength(3);
    expect(Object.values(vector.fillByKey ?? {})).toEqual(Array(3).fill([{ color: '#00ff00', opacity: 100, type: 'solid' }]));
  });

  it('should leave a single selected vector untouched', async () => {
    // mock
    store.dispatch(addNodes({ nodes: [{ ...buildFlattenedVector(), id: 'loneVector' }], rootIds: ['loneVector'] }));
    store.dispatch(setSelection(['loneVector']));

    const before = selectActivePage(store.getState()).nodes.loneVector;

    // action
    await handleFlattenSelection(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes.loneVector).toBe(before);
  });
});
