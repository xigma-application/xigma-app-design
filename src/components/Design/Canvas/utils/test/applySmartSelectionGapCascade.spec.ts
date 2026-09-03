// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { applySmartSelectionGapCascade } from '../applySmartSelectionGapCascade';

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 50, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 50, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('applySmartSelectionGapCascade', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should cascade every group along an axis, keeping the anchor fixed', () => {
    // mock — anchor at x0 width50, one group at x100
    const idB = addRect(100, 0);
    const cascade = { anchorPosition: 0, anchorSize: 50, cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }] };

    // action — apply gap 80 synchronously (no throttling)
    applySmartSelectionGapCascade(store.dispatch, cascade, 'x', { [idB]: { x: 100, y: 0 } }, 80);

    // result — new left edge = anchor(0) + anchorSize(50) + newGap(80) = 130
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 130, y: 0 });
  });

  it('should cascade multiple groups in order', () => {
    // mock
    const idB = addRect(0, 100);
    const idC = addRect(0, 200);
    const cascade = {
      anchorPosition: 0,
      anchorSize: 50,
      cascadeGroups: [
        { nodeIds: [idB], originalPosition: 100, size: 50 },
        { nodeIds: [idC], originalPosition: 200, size: 50 },
      ],
    };

    // action
    applySmartSelectionGapCascade(store.dispatch, cascade, 'y', { [idB]: { x: 0, y: 100 }, [idC]: { x: 0, y: 200 } }, 60);

    // result — b: 0+50+60=110; c: 110+50+60=220
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 0, y: 110 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idC]).toMatchObject({ x: 0, y: 220 });
  });
});
