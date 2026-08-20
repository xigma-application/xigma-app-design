import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { resolveVectorSegmentHover } from '../resolveVectorSegmentHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createHoveredVectorSegmentIdRef = (): RefObject<string | null> => ({ current: null });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
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

describe('resolveVectorSegmentHover', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();

    // before
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0), hoveredVectorSegmentIdRef);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
  });

  it('should set the hovered segment id when the pointer rests over the interior of a segment', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeId(nodeId));
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();

    // before
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0), hoveredVectorSegmentIdRef);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBe('s1');
  });

  it('should clear the hovered segment id once the pointer moves away from every segment', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeId(nodeId));
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();

    // before
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0), hoveredVectorSegmentIdRef);
    resolveVectorSegmentHover(canvas, pointerEvent(500, 500), hoveredVectorSegmentIdRef);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
  });
});
