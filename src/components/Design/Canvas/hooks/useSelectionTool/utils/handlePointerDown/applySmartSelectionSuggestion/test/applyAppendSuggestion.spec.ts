// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { applyAppendSuggestion } from '../applyAppendSuggestion';

const addRect = (x: number, y: number, width = 50, height = 50): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const node = (id: string, x: number, width = 50, y = 0, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('applyAppendSuggestion', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should append the outlier to the end of the sequence, snapping its cross-axis and spacing it by the sequence gap', () => {
    // mock — clean row A/B/C (gap 50), D is a spatial outlier
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const idD = addRect(400, 300);
    const suggestion = {
      axis: 'x' as const,
      insertAt: 'end' as const,
      layout: {
        gaps: [{ index: 0, midpoint: { x: 0, y: 0 }, span: { x1: 0, x2: 0, y1: 0, y2: 0 }, value: 50 }],
        nodes: [node(idA, 0), node(idB, 100), node(idC, 200)],
        type: 'row' as const,
      },
      outlierId: idD,
      type: 'append' as const,
    };

    // action
    applyAppendSuggestion(store.dispatch, suggestion);

    // result — d lands right after c: x=200+50+50=300, y snapped to the row's y=0
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idD]).toMatchObject({ x: 300, y: 0 });
    expect(nodes[idA]).toMatchObject({ x: 0, y: 0 });
    expect(nodes[idB]).toMatchObject({ x: 100, y: 0 });
    expect(nodes[idC]).toMatchObject({ x: 200, y: 0 });
  });

  it('should append the outlier to the start of the sequence when it is closer to that end', () => {
    // mock
    const idA = addRect(200, 0);
    const idB = addRect(300, 0);
    const idC = addRect(400, 0);
    const idD = addRect(0, 300);
    const suggestion = {
      axis: 'x' as const,
      insertAt: 'start' as const,
      layout: {
        gaps: [{ index: 0, midpoint: { x: 0, y: 0 }, span: { x1: 0, x2: 0, y1: 0, y2: 0 }, value: 50 }],
        nodes: [node(idA, 200), node(idB, 300), node(idC, 400)],
        type: 'row' as const,
      },
      outlierId: idD,
      type: 'append' as const,
    };

    // action
    applyAppendSuggestion(store.dispatch, suggestion);

    // result — d lands right before a: x=200-50-50=100, y snapped to the row's y=0
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idD]).toMatchObject({ x: 100, y: 0 });
  });

  it('should append along the y axis too, snapping the cross-axis (x) and spacing by the sequence gap', () => {
    // mock — clean column A/B/C at x=0 (gap 50), D is a spatial outlier
    const idA = addRect(0, 0);
    const idB = addRect(0, 100);
    const idC = addRect(0, 200);
    const idD = addRect(300, 400);
    const suggestion = {
      axis: 'y' as const,
      insertAt: 'end' as const,
      layout: {
        gaps: [{ index: 0, midpoint: { x: 0, y: 0 }, span: { x1: 0, x2: 0, y1: 0, y2: 0 }, value: 50 }],
        nodes: [node(idA, 0, 50, 0), node(idB, 0, 50, 100), node(idC, 0, 50, 200)],
        type: 'column' as const,
      },
      outlierId: idD,
      type: 'append' as const,
    };

    // action
    applyAppendSuggestion(store.dispatch, suggestion);

    // result — d lands right below c: y=200+50+50=300, x snapped to the column's x=0
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idD]).toMatchObject({ x: 0, y: 300 });
  });
});
