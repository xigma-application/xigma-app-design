// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { applyEqualizeSuggestion } from '../applyEqualizeSuggestion';

const addRect = (x: number, y: number, width = 50, height = 50): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const node = (id: string, x: number, width = 50, y = 0, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('applyEqualizeSuggestion', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should equalize every gap to the mean, keeping the anchor fixed and the far end invariant', () => {
    // mock — gaps of 10, 90, 200 (mean 100)
    const idA = addRect(0, 0);
    const idB = addRect(60, 0);
    const idC = addRect(200, 0);
    const idD = addRect(450, 0);
    const suggestion = {
      axis: 'x' as const,
      gapValues: [10, 90, 200],
      layout: { gaps: [], nodes: [node(idA, 0), node(idB, 60), node(idC, 200), node(idD, 450)], type: 'row' as const },
      type: 'equalize' as const,
    };

    // action
    applyEqualizeSuggestion(store.dispatch, suggestion);

    // result — b: 50+100=150; c: 150+50+100=300; d stays at 450 (mean preserves total span)
    const nodes = selectActivePage(store.getState()).nodes;

    expect(nodes[idA]).toMatchObject({ x: 0, y: 0 });
    expect(nodes[idB]).toMatchObject({ x: 150, y: 0 });
    expect(nodes[idC]).toMatchObject({ x: 300, y: 0 });
    expect(nodes[idD]).toMatchObject({ x: 450, y: 0 });
  });
});
