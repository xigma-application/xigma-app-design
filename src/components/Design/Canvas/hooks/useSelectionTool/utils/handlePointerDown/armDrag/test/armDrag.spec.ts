import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { armDrag } from '../armDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const createDragStateRef = (): RefObject<TDragState | null> => ({ current: null });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

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
    armDrag([idA], null, { x: 5, y: 5 }, dragStateRef, createCanvasRefs());

    // result
    expect(dragStateRef.current).toEqual({
      dispatchThrottle: { frameId: null, run: null },
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
    armDrag([idA], { id: idA, kind: 'collapse' }, { x: 10, y: 10 }, dragStateRef, createCanvasRefs());

    // result
    expect(dragStateRef.current).toMatchObject({
      nodeOrigins: { [idA]: { x1: 200, x2: 250, y1: 200, y2: 200 } },
      pendingClickAction: { id: idA, kind: 'collapse' },
    });
  });

  it('should snapshot a vector node origin as its vertices and segments', () => {
    // mock
    const idA = addVectorNode();
    const dragStateRef = createDragStateRef();

    // before
    armDrag([idA], null, { x: 0, y: 0 }, dragStateRef, createCanvasRefs());

    // result
    expect(dragStateRef.current?.nodeOrigins).toEqual({
      [idA]: {
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
      },
    });
  });
});
