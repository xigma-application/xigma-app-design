// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { applyGridEqualizeSuggestion } from '../applyGridEqualizeSuggestion';

const addRect = (x: number, y: number, width = 50, height = 50): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const node = (id: string, x: number, width = 50, y = 0, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('applyGridEqualizeSuggestion', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should equalize a grid on both axes independently, combining column and row deltas into one dispatch per cell', () => {
    // mock — 2x3 grid, column gaps [50, 100] (mean 75), row gap [50] (already uniform)
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(250, 0);
    const idD = addRect(0, 100);
    const idE = addRect(100, 100);
    const idF = addRect(250, 100);
    const geometry = { columnWidth: [50, 50, 50], columnX: [0, 100, 250], rowHeight: [50, 50], rowY: [0, 100] };
    const suggestion = {
      columnGapValues: [50, 100],
      layout: {
        cells: [
          [node(idA, 0), node(idB, 100), node(idC, 250)],
          [node(idD, 0, 50, 100), node(idE, 100, 50, 100), node(idF, 250, 50, 100)],
        ],
        columnCount: 3,
        columnGaps: [],
        geometry,
        rowCount: 2,
        rowGaps: [],
        type: 'grid' as const,
      },
      rowGapValues: [50],
      type: 'grid-equalize' as const,
    };

    // action
    applyGridEqualizeSuggestion(store.dispatch, suggestion);

    // result — column 1 (b, e) shifts by +25 (mean 75 vs original 50); column 2 (c, f) is invariant
    // (2-gap mean preserves the span, same as the row/column case); row gap was already uniform, so y is untouched
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idA]).toMatchObject({ x: 0, y: 0 });
    expect(nodes[idB]).toMatchObject({ x: 125, y: 0 });
    expect(nodes[idC]).toMatchObject({ x: 250, y: 0 });
    expect(nodes[idD]).toMatchObject({ x: 0, y: 100 });
    expect(nodes[idE]).toMatchObject({ x: 125, y: 100 });
    expect(nodes[idF]).toMatchObject({ x: 250, y: 100 });
  });
});
