import { RefObject } from 'react';

// store
import { addNode, deleteNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
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
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueMarqueeDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
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
    expect(selectSelectedIds(store.getState())).toEqual([]);
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
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
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
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  const addRectNode = (x: number, y: number, size: number): string => {
    store.dispatch(
      addNode({
        fill: '#00ff00',
        height: size,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: size,
        x,
        y,
      }),
    );

    return selectActivePage(store.getState()).rootOrder.at(-1) as string;
  };

  const buildFrameWithChild = (): { childId: string; frameId: string } => {
    const frameId = addFrameNode(0, 0, 400);
    const childId = addRectNode(40, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([]));

    return { childId, frameId };
  };

  it('should select the touched children of a frame the marquee only partially covers, not the frame', () => {
    // mock
    const { childId, frameId } = buildFrameWithChild();
    const canvas = createCanvas();

    // before — marquee from outside the frame, sweeping over the child but not enclosing the frame
    continueMarqueeDrag(canvas, pointerEvent(100, 100), store.dispatch, createMarqueeStartRef({ x: -20, y: -20 }), createMarqueeRef());

    // result
    expect(selectSelectedIds(store.getState())).toEqual([childId]);
    expect(selectSelectedIds(store.getState())).not.toContain(frameId);
  });

  it('should switch to the frame and drop its children once the marquee fully encloses the frame', () => {
    // mock
    const { childId, frameId } = buildFrameWithChild();
    const canvas = createCanvas();

    // before — marquee wraps the whole 400x400 frame
    continueMarqueeDrag(canvas, pointerEvent(500, 500), store.dispatch, createMarqueeStartRef({ x: -20, y: -20 }), createMarqueeRef());

    // result
    expect(selectSelectedIds(store.getState())).toEqual([frameId]);
    expect(selectSelectedIds(store.getState())).not.toContain(childId);
  });
});
