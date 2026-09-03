// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { applySmartSelectionSuggestion } from '../applySmartSelectionSuggestion';

const addRect = (x: number, y: number, width = 50, height = 50): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const node = (id: string, x: number, width = 50, y = 0, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

// each case here only proves the switch routes to the right handler — the handlers' own
// behavior is covered in depth by their own test/apply*.spec.ts files next to this one
describe('applySmartSelectionSuggestion', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should route an "equalize" suggestion to applyEqualizeSuggestion', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(60, 0);
    const idC = addRect(200, 0);
    const suggestion = {
      axis: 'x' as const,
      gapValues: [10, 90],
      layout: { gaps: [], nodes: [node(idA, 0), node(idB, 60), node(idC, 200)], type: 'row' as const },
      type: 'equalize' as const,
    };

    // action
    applySmartSelectionSuggestion(store.dispatch, suggestion);

    // result — mean gap (10+90)/2=50: a stays anchored at 0, b moves to 0+50+50=100
    expect(selectActivePage(store.getState()).nodes[idB]).toMatchObject({ x: 100 });
  });

  it('should route an "append" suggestion to applyAppendSuggestion', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(400, 300);
    const suggestion = {
      axis: 'x' as const,
      insertAt: 'end' as const,
      layout: {
        gaps: [{ index: 0, midpoint: { x: 0, y: 0 }, span: { x1: 0, x2: 0, y1: 0, y2: 0 }, value: 50 }],
        nodes: [node(idA, 0), node(idB, 100)],
        type: 'row' as const,
      },
      outlierId: idC,
      type: 'append' as const,
    };

    // action
    applySmartSelectionSuggestion(store.dispatch, suggestion);

    // result
    expect(selectActivePage(store.getState()).nodes[idC]).toMatchObject({ x: 200, y: 0 });
  });

  it('should route a "grid-equalize" suggestion to applyGridEqualizeSuggestion', () => {
    // mock — column gaps [50, 100] (mean 75)
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(250, 0);
    const suggestion = {
      columnGapValues: [50, 100],
      layout: {
        cells: [[node(idA, 0), node(idB, 100), node(idC, 250)]],
        columnCount: 3,
        columnGaps: [],
        geometry: { columnWidth: [50, 50, 50], columnX: [0, 100, 250], rowHeight: [50], rowY: [0] },
        rowCount: 1,
        rowGaps: [],
        type: 'grid' as const,
      },
      rowGapValues: [],
      type: 'grid-equalize' as const,
    };

    // action
    applySmartSelectionSuggestion(store.dispatch, suggestion);

    // result
    expect(selectActivePage(store.getState()).nodes[idB]).toMatchObject({ x: 125 });
  });

  it('should route a "grid-append" suggestion to applyGridAppendSuggestion (the default branch)', () => {
    // mock
    const idX = addRect(500, 500, 60, 60);
    const suggestion = {
      layout: {
        cells: [[node(idX, 500, 60, 500, 60)]],
        columnCount: 1,
        columnGaps: [],
        geometry: { columnWidth: [60], columnX: [500], rowHeight: [60], rowY: [500] },
        rowCount: 1,
        rowGaps: [],
        type: 'grid' as const,
      },
      outlierId: idX,
      target: { column: 1, height: 50, row: 0, width: 50, x: 100, y: 0 },
      type: 'grid-append' as const,
    };

    // action
    applySmartSelectionSuggestion(store.dispatch, suggestion);

    // result
    expect(selectActivePage(store.getState()).nodes[idX]).toMatchObject({ height: 50, width: 50, x: 100, y: 0 });
  });
});
