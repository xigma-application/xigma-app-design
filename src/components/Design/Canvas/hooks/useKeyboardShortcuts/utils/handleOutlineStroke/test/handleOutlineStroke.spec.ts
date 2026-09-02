// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TVectorNode } from 'types/design/types';

const { getTextOutlineAsStrokeGlyphVectors } = vi.hoisted(() => ({ getTextOutlineAsStrokeGlyphVectors: vi.fn() }));

vi.mock('utils/canvas/text/fontOutline/getTextOutlineAsStrokeGlyphVectors', () => ({ getTextOutlineAsStrokeGlyphVectors }));

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handleOutlineStroke } from '../handleOutlineStroke';

const buildLetter = (id: string): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  fillByKey: { [`face-${id}`]: [{ color: '#000000', opacity: 100, type: 'solid' }] },
  filledFaceKeys: [`face-${id}`],
  id,
  name: id,
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
});

const addSelectedText = (overrides: Record<string, unknown> = {}): string => {
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
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.text,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    } as never),
  );
  const [id] = selectActivePage(store.getState()).rootOrder.slice(-1);
  store.dispatch(setSelection([id]));

  return id;
};

describe('handleOutlineStroke', () => {
  it('should do nothing when the selection has no strokeable node', async () => {
    // mock
    store.dispatch(setSelection([]));

    // action
    await handleOutlineStroke(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([]);
  });

  it('should do nothing when the selected node has no stroke set', async () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 0, y: 0 }),
    );
    const [rectId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([rectId]));

    // action
    await handleOutlineStroke(store.dispatch);

    // result — untouched, still the plain rectangle
    expect(selectActivePage(store.getState()).nodes[rectId].type).toBe(NodeType.rectangle);
    expect(selectActivePage(store.getState()).selectedIds).toEqual([rectId]);
  });

  it('should replace a stroked shape in place with a single vector combining its fill and stroke outline', async () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rect',
        parentId: null,
        rotation: 0,
        strokeColor: '#000000',
        strokeWidth: 4,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const [rectId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([rectId]));

    // action
    await handleOutlineStroke(store.dispatch);

    // result — no group: same id, now a vector with both the fill and the outlined stroke as faces
    const page = selectActivePage(store.getState());
    const node = page.nodes[rectId];

    expect(node.type).toBe(NodeType.vector);
    expect(node.id).toBe(rectId);
    expect(page.selectedIds).toEqual([rectId]);
    expect(node.type === NodeType.vector ? node.filledFaceKeys.length : 0).toBeGreaterThanOrEqual(2);
  });

  it('should replace a line with its outline vector directly, since a line has no fill of its own', async () => {
    // mock
    store.dispatch(
      addNode({ name: 'Line', parentId: null, stroke: '#000000', strokeWidth: 4, type: NodeType.line, x1: 0, x2: 100, y1: 0, y2: 0 }),
    );
    const [lineId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([lineId]));

    // action
    await handleOutlineStroke(store.dispatch);

    // result — stored under the same key, and its own `id` field matches that key
    const page = selectActivePage(store.getState());
    expect(page.nodes[lineId].type).toBe(NodeType.vector);
    expect(page.nodes[lineId].id).toBe(lineId);
    expect(page.selectedIds).toEqual([lineId]);
  });

  it('should replace a single-letter stroked text directly, with no group wrapper', async () => {
    // mock
    const textId = addSelectedText({ content: 'I' });

    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([buildLetter('letter-1')]);

    // action
    await handleOutlineStroke(store.dispatch);

    // result — same id/slot as the original text, no group created around it
    const page = selectActivePage(store.getState());
    const wrappingGroup = Object.values(page.nodes).find(
      (candidate) => candidate.type === NodeType.group && candidate.childIds.includes(textId),
    );

    expect(page.nodes[textId].type).toBe(NodeType.vector);
    expect(page.rootOrder).toContain(textId);
    expect(wrappingGroup).toBeUndefined();
  });

  it('should group multiple letters instead of fusing them, matching Figma’s text-outline behavior', async () => {
    // mock
    const textId = addSelectedText({ content: 'Hi' });

    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([buildLetter('letter-1'), buildLetter('letter-2')]);

    // action
    await handleOutlineStroke(store.dispatch);

    // result — the text's own id is now the first letter, nested under a freshly created group
    // that took over the text's old root slot
    const page = selectActivePage(store.getState());
    const group = Object.values(page.nodes).find(
      (candidate): candidate is TGroupNode => candidate.type === NodeType.group && candidate.childIds.includes(textId),
    );

    expect(group).toBeDefined();
    expect(group?.childIds).toHaveLength(2);
    expect(page.rootOrder).toContain(group?.id);
    expect(page.rootOrder).not.toContain(textId);
    expect(page.nodes[textId].type).toBe(NodeType.vector);
    expect(page.nodes[textId].parentId).toBe(group?.id);
  });

  it('should delete the now-orphaned path node when outlining text bound to a path', async () => {
    // mock — a simple path the text is attached to
    store.dispatch(
      addNode({
        defaultFill: null,
        filledFaceKeys: [],
        name: 'Path',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: {},
      }),
    );
    const [pathId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    const textId = addSelectedText({ content: 'Hi', pathId });

    getTextOutlineAsStrokeGlyphVectors.mockResolvedValue([buildLetter('letter-1'), buildLetter('letter-2')]);

    // action
    await handleOutlineStroke(store.dispatch);

    // result — the path is gone, only the new group (holding the letters) remains
    const page = selectActivePage(store.getState());

    expect(page.nodes[pathId]).toBeUndefined();
    expect(page.rootOrder).not.toContain(pathId);
    expect(page.nodes[textId].type).toBe(NodeType.vector);
  });
});
