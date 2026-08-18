import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { armDrag } from '../armDrag';

const createDragStateRef = (): RefObject<TDragState | null> => ({ current: null });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('armDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should snapshot a box node origin and the pointer start into the drag state', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const dragStateRef = createDragStateRef();

    // before
    armDrag([idA], null, { x: 5, y: 5 }, dragStateRef);

    // result
    expect(dragStateRef.current).toEqual({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 5, y: 5 },
    });
  });

  it('should snapshot a line node origin as its endpoints', () => {
    // mock
    const idA = addLineNode(200, 200, 250, 200);
    const dragStateRef = createDragStateRef();

    // before
    armDrag([idA], { id: idA, kind: 'collapse' }, { x: 10, y: 10 }, dragStateRef);

    // result
    expect(dragStateRef.current).toMatchObject({
      nodeOrigins: { [idA]: { x1: 200, x2: 250, y1: 200, y2: 200 } },
      pendingClickAction: { id: idA, kind: 'collapse' },
    });
  });
});
