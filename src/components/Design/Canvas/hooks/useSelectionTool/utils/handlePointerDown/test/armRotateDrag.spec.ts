import { RefObject } from 'react';

// store
import { addNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TVectorNode } from 'types/design/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { armRotateDrag } from '../armRotateDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const createRotateDragRef = (): RefObject<TRotateDragState | null> => ({ current: null });

const frame = (id: string, x: number, y: number, width: number, height: number, rotation = 0): TFrameNode => ({
  fill: '#ff0000',
  height,
  id,
  name: 'Frame',
  parentId: null,
  rotation,
  childIds: [], clipContent: true, type: NodeType.frame,
  width,
  x,
  y,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 10,
  x2: 20,
  y1: 30,
  y2: 40,
};

const vector: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

describe('armRotateDrag', () => {
  it('should record the pivot, start angle and box-node origins, then capture the pointer', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();
    const node = frame('a', 0, 0, 100, 100, 30);

    // before — the pointer starts due east of the bounds' center (50, 50), so the start angle is 0;
    armRotateDrag(
      canvas,
      pointerEvent(3),
      rotateDragRef,
      [node],
      { height: 100, width: 100, x: 0, y: 0 },
      30,
      { x: 100, y: 50 },
      createCanvasRefs(),
    );

    // result
    expect(rotateDragRef.current).toEqual({
      cursorAngle: 30,
      nodeOrigins: { a: { height: 100, rotation: 30, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should record x1/y1/x2/y2 origins for a line node', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();

    // before
    armRotateDrag(
      canvas,
      pointerEvent(),
      rotateDragRef,
      [line],
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { x: 100, y: 50 },
      createCanvasRefs(),
    );

    // result
    expect(rotateDragRef.current?.nodeOrigins).toEqual({ 'line-1': { x1: 10, x2: 20, y1: 30, y2: 40 } });
  });

  it('should record vertex and segment origins for a vector node', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();

    // before
    armRotateDrag(
      canvas,
      pointerEvent(),
      rotateDragRef,
      [vector],
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { x: 100, y: 50 },
      createCanvasRefs(),
    );

    // result
    expect(rotateDragRef.current?.nodeOrigins).toEqual({
      'vector-1': {
        rotation: 0,
        segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
        vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      },
    });
  });

  it('should record the raw rotation and vertices of an already-rotated vector node as-is, without baking them together', () => {
    // mock — baking here would let a second rotate gesture silently reset the node's visual tilt to 0
    // (the earlier bug this guards against), so the origin must carry the live rotation and untouched
    // vertices side by side
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();
    const rotatedVector: TVectorNode = {
      ...vector,
      rotation: 90,
      segments: {},
      vertices: {
        v1: { id: 'v1', x: 100, y: 100 },
        v2: { id: 'v2', x: 110, y: 100 },
        v3: { id: 'v3', x: 110, y: 110 },
        v4: { id: 'v4', x: 100, y: 110 },
      },
    };

    // before
    armRotateDrag(
      canvas,
      pointerEvent(),
      rotateDragRef,
      [rotatedVector],
      { height: 10, width: 10, x: 100, y: 100 },
      90,
      {
        x: 110,
        y: 105,
      },
      createCanvasRefs(),
    );

    // result
    expect(rotateDragRef.current?.nodeOrigins).toEqual({
      'vector-1': {
        rotation: 90,
        segments: {},
        vertices: {
          v1: { id: 'v1', x: 100, y: 100 },
          v2: { id: 'v2', x: 110, y: 100 },
          v3: { id: 'v3', x: 110, y: 110 },
          v4: { id: 'v4', x: 100, y: 110 },
        },
      },
    });
  });

  it('should measure the start angle from the pointer position relative to the pivot', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();
    const node = frame('a', 0, 0, 100, 100);

    // before — the pointer starts due south of the center (50, 50), which is 90 degrees
    armRotateDrag(
      canvas,
      pointerEvent(),
      rotateDragRef,
      [node],
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { x: 50, y: 150 },
      createCanvasRefs(),
    );

    // result
    expect(rotateDragRef.current?.startAngle).toBe(90);
  });

  it('should rotate a selected group rigidly — the group node plus every descendant', () => {
    // mock
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef();

    store.dispatch(setSelection([]));
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'A', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#00ff00', height: 20, name: 'B', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 20, x: 80, y: 80 }),
    );

    const childIds = selectActivePage(store.getState()).rootOrder.slice(-2);

    store.dispatch(setSelection(childIds));
    store.dispatch(groupNodes());

    const [groupId] = selectSelectedIds(store.getState());

    // before
    armRotateDrag(
      canvas,
      pointerEvent(),
      rotateDragRef,
      selectSelectedNodes(store.getState()),
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { x: 100, y: 50 },
      createCanvasRefs(),
    );

    // result — the group turns as a rigid body, so its own rotation origin is included, group first
    expect(Object.keys(rotateDragRef.current?.nodeOrigins ?? {})).toEqual([groupId, ...childIds]);
  });
});
