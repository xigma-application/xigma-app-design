// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getEqualSpacingDragSnap } from '../getEqualSpacingDragSnap';

const addRect = (x: number, y: number, width = 100, height = 100, overrides: Record<string, unknown> = {}): string => {
  store.dispatch(
    addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y, ...overrides }),
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

describe('getEqualSpacingDragSnap', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should snap and produce guides for a single eligible node dragged near an equal-spacing pattern', () => {
    // mock — dragging from x=100 with a +2 delta lands 2px off the perfectly-centered (20px) spot
    const activeId = addRect(100, 100);
    const candidateShapes = [
      { bounds: { height: 100, width: 80, x: 0, y: 100 }, points: [] },
      { bounds: { height: 100, width: 50, x: 220, y: 100 }, points: [] },
    ];

    // action
    const snap = getEqualSpacingDragSnap(
      selectNodes(store.getState()),
      dragState({ [activeId]: { x: 100, y: 100 } }, candidateShapes),
      { x: 2, y: 0 },
      4,
    );

    // result
    expect(snap.delta).toEqual({ x: -2, y: 0 });
    expect(snap.guides?.lines).toHaveLength(2);
  });

  it('should return a zero delta and null guides for a multi-node drag', () => {
    // mock
    const a = addRect(100, 100);
    const b = addRect(500, 500);

    // action
    const snap = getEqualSpacingDragSnap(
      selectNodes(store.getState()),
      dragState({ [a]: { x: 100, y: 100 }, [b]: { x: 500, y: 500 } }),
      { x: 0, y: 0 },
      4,
    );

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });

  it('should return a zero delta and null guides for an ineligible node type (e.g. a group)', () => {
    // mock
    const activeId = addRect(100, 100, 100, 100, { childIds: [], type: NodeType.group });

    // action
    const snap = getEqualSpacingDragSnap(selectNodes(store.getState()), dragState({ [activeId]: { x: 100, y: 100 } }), { x: 0, y: 0 }, 4);

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });

  it('should return a zero delta and null guides for a line origin', () => {
    // mock
    store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 }));

    const { rootOrder } = selectActivePage(store.getState());
    const lineId = rootOrder[rootOrder.length - 1];

    // action
    const snap = getEqualSpacingDragSnap(
      selectNodes(store.getState()),
      dragState({ [lineId]: { x1: 0, x2: 10, y1: 0, y2: 0 } }),
      { x: 0, y: 0 },
      4,
    );

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });

  it('should return a zero delta and null guides when no equal-spacing pattern is close enough', () => {
    // mock
    const activeId = addRect(100, 100);

    // action
    const snap = getEqualSpacingDragSnap(
      selectNodes(store.getState()),
      dragState({ [activeId]: { x: 100, y: 100 } }, []),
      { x: 0, y: 0 },
      4,
    );

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: null });
  });
});
