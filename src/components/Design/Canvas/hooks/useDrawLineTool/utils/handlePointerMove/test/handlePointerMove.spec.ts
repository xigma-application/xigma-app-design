// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LineEndpoint, NodeType } from 'types/design/enums';

// types
import { TLineNode } from 'types/design/types';

// utils
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { handlePointerMove } from '../handlePointerMove';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1, ...options });

const createLineNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      endPoint: LineEndpoint.none,
      height: 0,
      name: 'Line',
      parentId: null,
      rotation: 0,
      startPoint: LineEndpoint.none,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      width: 0,
      x: 0,
      y: 0,
    }),
  );

  return payload.id;
};

describe('handlePointerMove', () => {
  it('should track the pointer’s client position even before a drag has started', () => {
    // mock
    const startRef = { current: null };
    const nodeIdRef = { current: null };
    const lastPointerClientPositionRef = { current: null };

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(20, 20),
      store.dispatch,
      IDENTITY_VIEWPORT,
      startRef,
      nodeIdRef,
      lastPointerClientPositionRef,
    );

    // result
    expect(lastPointerClientPositionRef.current).toEqual({ x: 20, y: 20 });
  });

  it('should do nothing when there is no in-progress node', () => {
    // before & result — must not throw with no in-progress line
    expect(() =>
      handlePointerMove(
        createCanvas(),
        pointerEvent(20, 20),
        store.dispatch,
        IDENTITY_VIEWPORT,
        { current: { x: 0, y: 0 } },
        { current: null },
        { current: null },
      ),
    ).not.toThrow();
  });

  it('should update the far endpoint of the in-progress line, rounded and angle-snapped, while dragging', () => {
    // mock — near-horizontal drag, softly snaps flat even without Shift
    const nodeId = createLineNode();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: null };

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(150, 5),
      store.dispatch,
      IDENTITY_VIEWPORT,
      startRef,
      { current: nodeId },
      lastPointerClientPositionRef,
    );

    // result — x1/y1 stay anchored to the drag start, only x2/y2 move
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x1: 0, x2: 150, y1: 0, y2: 0 });
  });

  it('should hard-snap to the nearest 15° increment while Shift is held', () => {
    // mock
    const nodeId = createLineNode();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: null };

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(100, 20, { shiftKey: true }),
      store.dispatch,
      IDENTITY_VIEWPORT,
      startRef,
      { current: nodeId },
      lastPointerClientPositionRef,
    );

    // result
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x2: 98, y2: 26 });
  });
});
