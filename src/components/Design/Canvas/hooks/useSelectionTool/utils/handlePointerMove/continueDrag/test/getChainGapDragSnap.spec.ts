// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getChainGapDragSnap } from '../getChainGapDragSnap';

const addRect = (x: number, y: number, size = 20, overrides: Record<string, unknown> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#000',
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x,
      y,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const dragState = (nodeOrigins: TDragState['nodeOrigins'], candidateShapes: TDragState['candidateShapes'] = []): TDragState => ({
  candidateShapes,
  dispatchThrottle: { frameId: null, run: null },
  hasMoved: true,
  nodeOrigins,
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
});

describe('getChainGapDragSnap', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should snap and produce guides for a single eligible node dragged near a matching gap pattern', () => {
    // mock — shape1 (0..30) and shape2 (40..90) sit with a 10px gap; active dragged from x:98 with a
    // 0 delta lands 2px short of the x:100 that would give it the same 10px gap to shape2
    const activeId = addRect(98, 0, 20);
    const candidateShapes = [
      { bounds: { height: 30, width: 30, x: 0, y: 0 }, points: [] },
      { bounds: { height: 50, width: 50, x: 40, y: 0 }, points: [] },
    ];

    // action
    const snap = getChainGapDragSnap(
      selectNodes(store.getState()),
      dragState({ [activeId]: { x: 98, y: 0 } }, candidateShapes),
      { x: 0, y: 0 },
      8,
    );

    // result
    expect(snap.delta).toEqual({ x: 2, y: 0 });
    expect(snap.guides?.lines).toHaveLength(2);
  });

  it('should return a zero delta and null guides for a multi-node drag', () => {
    // mock
    const a = addRect(0, 0);
    const b = addRect(100, 100);

    // action
    const snap = getChainGapDragSnap(
      selectNodes(store.getState()),
      dragState({ [a]: { x: 0, y: 0 }, [b]: { x: 100, y: 100 } }),
      { x: 0, y: 0 },
      8,
    );

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });

  it('should return a zero delta and null guides for an ineligible node type (e.g. a group)', () => {
    // mock
    const activeId = addRect(0, 0, 20, { childIds: [], type: NodeType.group });

    // action
    const snap = getChainGapDragSnap(selectNodes(store.getState()), dragState({ [activeId]: { x: 0, y: 0 } }), { x: 0, y: 0 }, 8);

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });

  it('should return a zero delta and null guides for a line origin', () => {
    // mock
    store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 }));

    const { rootOrder } = selectActivePage(store.getState());
    const lineId = rootOrder[rootOrder.length - 1];

    // action
    const snap = getChainGapDragSnap(
      selectNodes(store.getState()),
      dragState({ [lineId]: { x1: 0, x2: 10, y1: 0, y2: 0 } }),
      { x: 0, y: 0 },
      8,
    );

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });

  it('should return a zero delta and null guides when no matching gap pattern is close enough', () => {
    // mock
    const activeId = addRect(0, 0);

    // action
    const snap = getChainGapDragSnap(selectNodes(store.getState()), dragState({ [activeId]: { x: 0, y: 0 } }, []), { x: 0, y: 0 }, 8);

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });
});
