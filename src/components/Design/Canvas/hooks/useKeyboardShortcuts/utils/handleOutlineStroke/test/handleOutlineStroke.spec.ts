// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { handleOutlineStroke } from '../handleOutlineStroke';

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
});
