import { RefObject } from 'react';

// store
import { addNode, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TArmedMedia } from '../../loadArmedMedia';
import { TAspectRatioLockGuide, TPoint } from 'types/canvas';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1 });

const createArmedRef = (armed: TArmedMedia | null = null): RefObject<TArmedMedia | null> => ({ current: armed });
const createStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createAspectRatioLockGuideRef = (): RefObject<TAspectRatioLockGuide | null> => ({ current: null });

const armed: TArmedMedia = { kind: 'image', naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' };

const createMediaNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      flipX: false,
      flipY: false,
      height: 1,
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: armed.src,
      type: NodeType.media,
      width: 1,
      x: 0,
      y: 0,
    }),
  );

  return payload.id;
};

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no file is armed', () => {
    // mock
    const canvas = createCanvas();
    const nodeId = createMediaNode();
    const aspectRatioLockGuideRef = createAspectRatioLockGuideRef();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(50, 50),
      store.dispatch,
      store,
      createArmedRef(null),
      createStartRef({ x: 0, y: 0 }),
      { current: nodeId },
      aspectRatioLockGuideRef,
    );

    // result
    expect(aspectRatioLockGuideRef.current).toBeNull();
  });

  it('should do nothing when the drag has not started', () => {
    // mock
    const canvas = createCanvas();
    const aspectRatioLockGuideRef = createAspectRatioLockGuideRef();

    // before & result — must not throw with no in-progress node
    expect(() =>
      handlePointerMove(
        canvas,
        pointerEvent(50, 50),
        store.dispatch,
        store,
        createArmedRef(armed),
        createStartRef(null),
        { current: null },
        aspectRatioLockGuideRef,
      ),
    ).not.toThrow();

    // result
    expect(aspectRatioLockGuideRef.current).toBeNull();
  });

  it('should resize the in-progress node to a live aspect-ratio-locked size while dragging', () => {
    // mock
    const canvas = createCanvas();
    const nodeId = createMediaNode();
    const aspectRatioLockGuideRef = createAspectRatioLockGuideRef();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(50, 50),
      store.dispatch,
      store,
      createArmedRef(armed),
      createStartRef({ x: 0, y: 0 }),
      { current: nodeId },
      aspectRatioLockGuideRef,
    );

    // result — raw 50x50 drag locked to the armed file's 2:1 ratio, driven by the taller raw axis
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should also populate the aspect-ratio-lock guide while dragging, unconditionally — Media never needs Shift for this', () => {
    // mock
    const canvas = createCanvas();
    const nodeId = createMediaNode();
    const aspectRatioLockGuideRef = createAspectRatioLockGuideRef();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(50, 50),
      store.dispatch,
      store,
      createArmedRef(armed),
      createStartRef({ x: 0, y: 0 }),
      { current: nodeId },
      aspectRatioLockGuideRef,
    );

    // result
    expect(aspectRatioLockGuideRef.current).toEqual({ height: 50, rotation: 0, width: 100, x: 0, y: 0 });
  });

  it('should convert the pointer position through the current viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const nodeId = createMediaNode();
    const aspectRatioLockGuideRef = createAspectRatioLockGuideRef();

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before
    handlePointerMove(
      canvas,
      pointerEvent(150, 90),
      store.dispatch,
      store,
      createArmedRef(armed),
      createStartRef({ x: 0, y: 0 }),
      { current: nodeId },
      aspectRatioLockGuideRef,
    );

    // result — screen (150,90) under viewport {x:150,y:90} is world (0,0), same as the start point
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ x: 0, y: 0 });
  });
});
