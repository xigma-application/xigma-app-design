import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { continueMarqueeDrag } from '../continueMarqueeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, ...options });

const createMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createMarqueeRef = (rect: TDraftRect | null = null): RefObject<TDraftRect | null> => ({ current: rect });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueMarqueeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no marquee drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const marqueeRef = createMarqueeRef();

    // before
    continueMarqueeDrag(canvas, pointerEvent(10, 10), store.dispatch, createMarqueeStartRef(), marqueeRef);

    // result
    expect(marqueeRef.current).toBeNull();
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should update the marquee preview rect and select nodes it partially overlaps', () => {
    // mock
    const idA = addFrameNode(100, 100, 20);
    const canvas = createCanvas();
    const marqueeStartRef = createMarqueeStartRef({ x: 0, y: 0 });
    const marqueeRef = createMarqueeRef();

    // before
    continueMarqueeDrag(canvas, pointerEvent(110, 110), store.dispatch, marqueeStartRef, marqueeRef);

    // result
    expect(marqueeRef.current).toEqual({ height: 110, width: 110, x: 0, y: 0 });
    expect(store.getState().design.selectedIds).toEqual([idA]);
  });

  it('should require full containment when the control key is held', () => {
    // mock
    addFrameNode(100, 100, 200);

    const canvas = createCanvas();
    const marqueeStartRef = createMarqueeStartRef({ x: 0, y: 0 });
    const marqueeRef = createMarqueeRef();

    // before — marquee only partially covers the large node
    continueMarqueeDrag(canvas, pointerEvent(110, 110, { ctrlKey: true }), store.dispatch, marqueeStartRef, marqueeRef);

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });
});
