import { RefObject } from 'react';

// store
import { addGuide, addNode, groupNodes, setSelection, setViewport } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';
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
      defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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
      candidateShapes: [],
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

  it('should expand a group id into the group itself plus its child origins so the whole group drags together', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(100, 100);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    const [groupId] = selectSelectedIds(store.getState());
    const groupOrigin = selectActivePage(store.getState()).nodes[groupId] as TGroupNode;
    const dragStateRef = createDragStateRef();

    // before
    armDrag([groupId], null, { x: 0, y: 0 }, dragStateRef, createCanvasRefs());

    // result — the group node's own origin is included so its box (needed while rotated) translates too
    expect(dragStateRef.current?.nodeOrigins).toEqual({
      [groupId]: { x: groupOrigin.x, y: groupOrigin.y },
      [idA]: { x: 0, y: 0 },
      [idB]: { x: 100, y: 100 },
    });
  });

  it('should include a candidate shape for every guide, when the canvas ref is available', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const dragStateRef = createDragStateRef();
    const canvas = document.createElement('canvas');

    Object.defineProperty(canvas, 'clientWidth', { value: 800 });
    Object.defineProperty(canvas, 'clientHeight', { value: 600 });
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 40 }));

    // before
    armDrag([idA], null, { x: 5, y: 5 }, dragStateRef, createCanvasRefs({ canvasRef: { current: canvas } }));

    // result
    expect(dragStateRef.current?.candidateShapes).toContainEqual({
      bounds: { height: 600, width: 0, x: 40, y: 0 },
      points: expect.any(Array),
    });
  });

  it('should not include any guide candidate shapes when the canvas ref is not available yet', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const dragStateRef = createDragStateRef();

    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 999 }));

    // before
    armDrag([idA], null, { x: 5, y: 5 }, dragStateRef, createCanvasRefs());

    // result
    expect(dragStateRef.current?.candidateShapes).not.toContainEqual(
      expect.objectContaining({ bounds: expect.objectContaining({ x: 999 }) }),
    );
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
