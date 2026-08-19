import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorHandleHover } from 'types/design/canvas/types';

// utils
import { resolveVectorTangentHandleHover } from '../resolveVectorTangentHandleHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createHoveredVectorHandleRef = (): RefObject<TVectorHandleHover | null> => ({ current: null });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorTangentHandleHover', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const hoveredVectorHandleRef = createHoveredVectorHandleRef();

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), hoveredVectorHandleRef);

    // result
    expect(hoveredVectorHandleRef.current).toBeNull();
  });

  it('should set the hovered handle when the pointer rests on a tangent handle', () => {
    // mock — s1's start handle sits at v1(0,0) + tangentStart(5,0) = (5,0)
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const hoveredVectorHandleRef = createHoveredVectorHandleRef();

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), hoveredVectorHandleRef);

    // result
    expect(hoveredVectorHandleRef.current).toEqual({ end: 'start', segmentId: 's1' });
  });

  it('should clear the hovered handle once the pointer moves away from every handle', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const hoveredVectorHandleRef = createHoveredVectorHandleRef();

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), hoveredVectorHandleRef);
    resolveVectorTangentHandleHover(canvas, pointerEvent(50, 50), hoveredVectorHandleRef);

    // result
    expect(hoveredVectorHandleRef.current).toBeNull();
  });
});
