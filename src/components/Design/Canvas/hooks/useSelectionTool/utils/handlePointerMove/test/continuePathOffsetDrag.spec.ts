import { RefObject } from 'react';

// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPathOffsetDragState } from '../../../types';

// utils
import { continuePathOffsetDrag } from '../continuePathOffsetDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createPathOffsetDragRef = (dragState: TPathOffsetDragState | null = null): RefObject<TPathOffsetDragState | null> => ({
  current: dragState,
});

const addPathTextNode = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      pathFlip: false,
      pathId: 'ellipse-1',
      pathStartOffset: 0,
      rotation: 0,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continuePathOffsetDrag', () => {
  it('should do nothing when no path-offset drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const id = addPathTextNode(5000, 5000, 200);
    const before = store.getState().design.nodes[id];

    // before
    continuePathOffsetDrag(canvas, pointerEvent(10, 10), store.dispatch, createPathOffsetDragRef());

    // result
    expect(store.getState().design.nodes[id]).toEqual(before);
  });

  it('should update pathStartOffset to the nearest point on the curve to the pointer', () => {
    // mock
    const canvas = createCanvas();
    const id = addPathTextNode(5200, 5200, 200);
    const pathOffsetDragRef = createPathOffsetDragRef({ nodeId: id });

    // before — bottom of the ellipse (center 5300,5300, radius 100) is a quarter turn from the right edge (offset 0)
    continuePathOffsetDrag(canvas, pointerEvent(5300, 5400), store.dispatch, pathOffsetDragRef);

    // result
    const node = store.getState().design.nodes[id];

    expect(node).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
  });

  it('should do nothing when the dragged node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const pathOffsetDragRef = createPathOffsetDragRef({ nodeId: 'missing' });

    // before
    continuePathOffsetDrag(canvas, pointerEvent(10, 10), store.dispatch, pathOffsetDragRef);

    // result
    expect(store.getState().design.nodes.missing).toBeUndefined();
  });
});
