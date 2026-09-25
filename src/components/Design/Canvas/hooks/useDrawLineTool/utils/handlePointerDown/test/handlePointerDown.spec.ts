// store
import { setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LineEndpoint, NodeType } from 'types/design/enums';

// types
import { TLineNode } from 'types/design/types';

// utils
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should track the pointer’s client position even for a non-primary button, without creating a node', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const nodeIdRef = { current: null };
    const lastPointerClientPositionRef = { current: null };
    const dropTargetRef = { current: null };
    const before = selectActivePage(store.getState()).rootOrder.length;

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      startRef,
      nodeIdRef,
      lastPointerClientPositionRef,
      dropTargetRef,
      LineEndpoint.none,
      LineEndpoint.none,
      '#000000',
      'Line',
    );

    // result
    expect(lastPointerClientPositionRef.current).toEqual({ x: 10, y: 10 });
    expect(startRef.current).toBeNull();
    expect(nodeIdRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(before);
  });

  it('should create a zero-length line at the pointer-down point, select it, and capture the pointer on a primary press', () => {
    // mock
    store.dispatch(setSelection(['stale-id']));

    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const startRef = { current: null };
    const nodeIdRef: { current: string | null } = { current: null };
    const lastPointerClientPositionRef = { current: null };
    const dropTargetRef = { current: null };

    // before
    handlePointerDown(
      canvas,
      pointerEvent(50, 60),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      nodeIdRef,
      lastPointerClientPositionRef,
      dropTargetRef,
      LineEndpoint.none,
      LineEndpoint.none,
      '#000000',
      'Line',
    );

    // result
    const page = selectActivePage(store.getState());

    expect(startRef.current).toEqual({ x: 50, y: 60 });
    expect(nodeIdRef.current).not.toBeNull();
    expect(page.nodes[nodeIdRef.current as string]).toMatchObject({
      strokeWidth: 1,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
    });
    expect(getLinePoints(page.nodes[nodeIdRef.current as string] as TLineNode)).toMatchObject({ x1: 50, x2: 50, y1: 60, y2: 60 });
    expect(page.selectedIds).toEqual([nodeIdRef.current]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(refs.drawing.cancelDrawRef.current).not.toBeNull();

    // mock
    const createdId = nodeIdRef.current as unknown as string;

    // action
    refs.drawing.cancelDrawRef.current?.();

    // result
    expect(selectActivePage(store.getState()).nodes[createdId]).toBeUndefined();
  });
});
