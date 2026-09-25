// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerMove } from '../handlePointerMove';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1, ...options });

const createPolygonNode = (sides: number): string => {
  const { payload } = store.dispatch(
    addNode({
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      flipX: false,
      flipY: false,
      height: 1,
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides,
      type: NodeType.polygon,
      width: 1,
      x: 20,
      y: 20,
    }),
  );

  return payload.id;
};

describe('handlePointerMove', () => {
  it('should do nothing when the drag has not started', () => {
    // mock
    const refs = createCanvasRefs();
    const nodeId = createPolygonNode(3);

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(50, 50),
      store.dispatch,
      refs,
      IDENTITY_VIEWPORT,
      { current: null },
      { current: nodeId },
      {
        current: [],
      },
    );

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ height: 1, width: 1 });
  });

  it('should do nothing when there is no node id to resize', () => {
    // before & result — must not throw with no in-progress node
    expect(() =>
      handlePointerMove(
        createCanvas(),
        pointerEvent(50, 50),
        store.dispatch,
        createCanvasRefs(),
        IDENTITY_VIEWPORT,
        { current: { x: 20, y: 20 } },
        { current: null },
        { current: [] },
      ),
    ).not.toThrow();
  });

  it('should resize the in-progress polygon and update the alignment guide as the pointer moves', () => {
    // mock
    const refs = createCanvasRefs();
    const nodeId = createPolygonNode(5);

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(120, 130),
      store.dispatch,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: nodeId },
      { current: [] },
    );

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ height: 110, sides: 5, width: 100, x: 20, y: 20 });
    expect(refs.transform.aspectRatioLockGuideRef.current).toBeNull();
  });

  it('should set a square aspect-ratio-lock guide while Shift is held', () => {
    // mock
    const refs = createCanvasRefs();
    const nodeId = createPolygonNode(3);

    // before
    handlePointerMove(
      createCanvas(),
      pointerEvent(120, 130, { shiftKey: true }),
      store.dispatch,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: nodeId },
      { current: [] },
    );

    // result
    expect(refs.transform.aspectRatioLockGuideRef.current).toMatchObject({ rotation: 0 });
  });
});
