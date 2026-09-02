// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getMatchedPairDragGuides } from '../getMatchedPairDragGuides';

const addRect = (x: number, y: number, width: number, height: number, overrides: Record<string, unknown> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#000',
      height,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width,
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

describe('getMatchedPairDragGuides', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should produce guides for a single eligible node dragged onto a same-size, centred neighbour', () => {
    // mock — active 200x100 at y:200, neighbour 200x100 at y:0 (100px gap, same centre x)
    const activeId = addRect(0, 200, 200, 100);
    const candidateShapes = [{ bounds: { height: 100, width: 200, x: 0, y: 0 }, points: [] }];

    // action
    const guides = getMatchedPairDragGuides(
      selectNodes(store.getState()),
      dragState({ [activeId]: { x: 0, y: 200 } }, candidateShapes),
      { x: 0, y: 0 },
      0.5,
      4,
    );

    // result
    expect(guides?.lines).toHaveLength(3);
  });

  it('should return null for a multi-node drag', () => {
    const a = addRect(0, 0, 20, 20);
    const b = addRect(100, 100, 20, 20);

    const guides = getMatchedPairDragGuides(
      selectNodes(store.getState()),
      dragState({ [a]: { x: 0, y: 0 }, [b]: { x: 100, y: 100 } }),
      { x: 0, y: 0 },
      0.5,
      4,
    );

    expect(guides).toBeNull();
  });

  it('should return null for an ineligible node type (e.g. a group)', () => {
    const activeId = addRect(0, 200, 200, 100, { childIds: [], type: NodeType.group });

    const guides = getMatchedPairDragGuides(
      selectNodes(store.getState()),
      dragState({ [activeId]: { x: 0, y: 200 } }),
      { x: 0, y: 0 },
      0.5,
      4,
    );

    expect(guides).toBeNull();
  });

  it('should return null for a line origin', () => {
    store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 }));

    const { rootOrder } = selectActivePage(store.getState());
    const lineId = rootOrder[rootOrder.length - 1];

    const guides = getMatchedPairDragGuides(
      selectNodes(store.getState()),
      dragState({ [lineId]: { x1: 0, x2: 10, y1: 0, y2: 0 } }),
      { x: 0, y: 0 },
      0.5,
      4,
    );

    expect(guides).toBeNull();
  });

  it('should return null when no same-size centred neighbour is present', () => {
    const activeId = addRect(0, 200, 200, 100);

    const guides = getMatchedPairDragGuides(
      selectNodes(store.getState()),
      dragState({ [activeId]: { x: 0, y: 200 } }, []),
      { x: 0, y: 0 },
      0.5,
      4,
    );

    expect(guides).toBeNull();
  });
});
