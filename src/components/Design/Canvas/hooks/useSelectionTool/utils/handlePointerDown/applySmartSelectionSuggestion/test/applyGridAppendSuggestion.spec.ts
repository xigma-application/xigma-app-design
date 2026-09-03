// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { applyGridAppendSuggestion } from '../applyGridAppendSuggestion';

const addRect = (x: number, y: number, width = 50, height = 50, rotation = 0): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const node = (id: string, x: number, width = 50, y = 0, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('applyGridAppendSuggestion', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should relocate and resize an axis-aligned box outlier into its target grid cell', () => {
    // mock — outlier is a different size than the target cell, and must be resized to fit
    const idX = addRect(500, 500, 60, 60);
    const dummyLayout = {
      cells: [[node(idX, 500, 60, 500, 60)]],
      columnCount: 1,
      columnGaps: [],
      geometry: { columnWidth: [60], columnX: [500], rowHeight: [60], rowY: [500] },
      rowCount: 1,
      rowGaps: [],
      type: 'grid' as const,
    };
    const suggestion = {
      layout: dummyLayout,
      outlierId: idX,
      target: { column: 1, height: 50, row: 0, width: 50, x: 100, y: 0 },
      type: 'grid-append' as const,
    };

    // action
    applyGridAppendSuggestion(store.dispatch, suggestion);

    // result — repositioned AND resized to the target cell's dimensions
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idX]).toMatchObject({ height: 50, width: 50, x: 100, y: 0 });
  });

  it('should reposition but not resize a rotated outlier', () => {
    // mock — rotated 90 degrees, resize is skipped to avoid incorrect rotated-bounds math
    const idX = addRect(500, 500, 60, 60, 90);
    const dummyLayout = {
      cells: [[node(idX, 500, 60, 500, 60)]],
      columnCount: 1,
      columnGaps: [],
      geometry: { columnWidth: [60], columnX: [500], rowHeight: [60], rowY: [500] },
      rowCount: 1,
      rowGaps: [],
      type: 'grid' as const,
    };
    const suggestion = {
      layout: dummyLayout,
      outlierId: idX,
      target: { column: 1, height: 50, row: 0, width: 50, x: 100, y: 0 },
      type: 'grid-append' as const,
    };

    // action
    applyGridAppendSuggestion(store.dispatch, suggestion);

    // result — position updated, size left alone
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idX]).toMatchObject({ height: 60, width: 60 });
  });
});
