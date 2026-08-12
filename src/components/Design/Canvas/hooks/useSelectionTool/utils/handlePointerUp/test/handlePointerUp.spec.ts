import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TDragState, TEndpointDragState } from '../../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createDragStateRef = (dragState: TDragState | null = null): RefObject<TDragState | null> => ({ current: dragState });
const createEndpointDragRef = (endpointDragState: TEndpointDragState | null = null): RefObject<TEndpointDragState | null> => ({
  current: endpointDragState,
});
const createMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createMarqueeRef = (rect: TDraftRect | null = null): RefObject<TDraftRect | null> => ({ current: rect });

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag, endpoint-drag or marquee is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      createDragStateRef(),
      createEndpointDragRef(),
      createMarqueeStartRef(),
      createMarqueeRef(),
    );

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should delegate to disarmDrag for a pending drag', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: {},
      pendingClickAction: { id: 'a', kind: 'collapse' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      dragStateRef,
      createEndpointDragRef(),
      createMarqueeStartRef(),
      createMarqueeRef(),
    );

    // result
    expect(store.getState().design.selectedIds).toEqual(['a']);
    expect(dragStateRef.current).toBeNull();
  });

  it('should delegate to disarmEndpointDrag for a pending endpoint drag', () => {
    // mock
    const canvas = createCanvas();
    const endpointDragRef = createEndpointDragRef({ endpoint: 'a', nodeId: 'line-1' });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
      store.dispatch,
      createDragStateRef(),
      endpointDragRef,
      createMarqueeStartRef(),
      createMarqueeRef(),
    );

    // result
    expect(endpointDragRef.current).toBeNull();
  });

  it('should delegate to disarmMarqueeDrag for a pending marquee', () => {
    // mock
    const canvas = createCanvas();
    const marqueeStartRef = createMarqueeStartRef({ x: 10, y: 10 });
    const marqueeRef = createMarqueeRef({ height: 5, width: 5, x: 10, y: 10 });

    // before
    handlePointerUp(canvas, pointerEvent(), store.dispatch, createDragStateRef(), createEndpointDragRef(), marqueeStartRef, marqueeRef);

    // result
    expect(marqueeStartRef.current).toBeNull();
    expect(marqueeRef.current).toBeNull();
  });
});
