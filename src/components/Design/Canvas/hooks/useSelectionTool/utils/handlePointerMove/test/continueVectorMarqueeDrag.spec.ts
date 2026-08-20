import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { continueVectorMarqueeDrag } from '../continueVectorMarqueeDrag';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 500, y: 500 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorMarqueeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when no vector marquee is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    continueVectorMarqueeDrag(canvas, pointerEvent(10, 10), canvasRefs, createVectorMarqueeStartRef());

    // result
    expect(canvasRefs.marqueeRef.current).toBeNull();
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    continueVectorMarqueeDrag(canvas, pointerEvent(10, 10), canvasRefs, createVectorMarqueeStartRef({ x: 0, y: 0 }));

    // result
    expect(canvasRefs.marqueeRef.current).toBeNull();
  });

  it('should draw the marquee rect and select the vertex whose point falls inside it, leaving points outside untouched', () => {
    // mock — v1(0,0)/v2(100,0) selected via the marquee's own tangentStart/tangentEnd handles too; v3(500,500) stays outside
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — marquee (0,0) -> (5,0): a thin sliver that only ever contains v1 and s1's real tangentStart handle at (5,0)
    continueVectorMarqueeDrag(canvas, pointerEvent(5, 0), canvasRefs, createVectorMarqueeStartRef({ x: 0, y: 0 }));

    // result
    expect(canvasRefs.marqueeRef.current).toEqual({ height: 0, width: 5, x: 0, y: 0 });
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
  });

  it('should select nothing when the marquee misses every point', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — marquee far away from every vertex/handle
    continueVectorMarqueeDrag(canvas, pointerEvent(2000, 2000), canvasRefs, createVectorMarqueeStartRef({ x: 1900, y: 1900 }));

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });
});
