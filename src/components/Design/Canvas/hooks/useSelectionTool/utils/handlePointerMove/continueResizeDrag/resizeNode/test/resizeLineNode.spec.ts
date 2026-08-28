// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { resizeLineNode } from '../resizeLineNode';

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resizeLineNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should scale a line by its endpoints, anchored at the opposite side on each axis', () => {
    // mock
    const idLine = addLineNode(20, 20, 80, 80);

    // before
    resizeLineNode(idLine, { x1: 20, x2: 80, y1: 20, y2: 80 }, store.dispatch, { x: 0, y: 0 }, 2, 2);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idLine]).toMatchObject({
      x1: 40,
      x2: 160,
      y1: 40,
      y2: 160,
    });
  });

  it('should leave an axis untouched when it has no anchor', () => {
    // mock
    const idLine = addLineNode(20, 20, 80, 80);

    // before — only the X axis is being resized
    resizeLineNode(idLine, { x1: 20, x2: 80, y1: 20, y2: 80 }, store.dispatch, { x: 0, y: null }, 2, 1);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idLine]).toMatchObject({
      x1: 40,
      x2: 160,
      y1: 20,
      y2: 80,
    });
  });
});
