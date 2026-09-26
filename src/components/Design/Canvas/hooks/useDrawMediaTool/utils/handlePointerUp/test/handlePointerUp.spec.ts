import { RefObject } from 'react';

// store
import { addNode, setActiveTool, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TArmedMedia } from '../../loadArmedMedia';
import { TAspectRatioLockGuide, TDraftRect, TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerUp } from '../handlePointerUp';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1 });

const createArmedRef = (armed: TArmedMedia | null): RefObject<TArmedMedia | null> => ({ current: armed });
const createStartRef = (point: TPoint | null): RefObject<TPoint | null> => ({ current: point });
const createQueueRef = (files: File[] = []): RefObject<File[]> => ({ current: files });
const createAspectRatioLockGuideRef = (): RefObject<TAspectRatioLockGuide | null> => ({
  current: { height: 1, rotation: 0, width: 1, x: 0, y: 0 },
});

const armed: TArmedMedia = { kind: 'image', naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' };

const createMediaNode = (rect: TDraftRect): string => {
  const { payload } = store.dispatch(
    addNode({ ...rect, flipX: false, flipY: false, name: 'Image', parentId: null, rotation: 0, src: armed.src, type: NodeType.media }),
  );

  return payload.id;
};

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no file is armed', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const nodeId = createMediaNode({ height: 1, width: 1, x: 0, y: 0 });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createCanvasRefs(),
      createArmedRef(null),
      createStartRef({ x: 0, y: 0 }),
      { current: nodeId },
      { current: null },
      createQueueRef(),
      createAspectRatioLockGuideRef(),
    );

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should do nothing when the drag never started', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createCanvasRefs(),
      createArmedRef(armed),
      createStartRef(null),
      { current: null },
      { current: null },
      createQueueRef(),
      createAspectRatioLockGuideRef(),
    );

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should leave the already-centered node untouched on a plain click, reset drag state, and revert to the default tool when the queue is empty', () => {
    // mock — the node was already created centered on (10,10) by handlePointerDown
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const startRef = createStartRef({ x: 10, y: 10 });
    const aspectRatioLockGuideRef = createAspectRatioLockGuideRef();
    const nodeId = createMediaNode({ height: 100, width: 200, x: -90, y: -40 });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createCanvasRefs(),
      createArmedRef(armed),
      startRef,
      { current: nodeId },
      { current: null },
      createQueueRef(),
      aspectRatioLockGuideRef,
    );

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.nodes[nodeId]).toMatchObject({ height: 100, src: 'blob:mock-url', type: NodeType.media, width: 200, x: -90, y: -40 });
    expect(startRef.current).toBeNull();
    expect(aspectRatioLockGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should place an aspect-ratio-locked custom size on a drag', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const nodeId = createMediaNode({ height: 1, width: 1, x: 0, y: 0 });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(50, 50),
      store.dispatch,
      store,
      canvasRef,
      createCanvasRefs(),
      createArmedRef(armed),
      createStartRef({ x: 0, y: 0 }),
      { current: nodeId },
      { current: null },
      createQueueRef(),
      createAspectRatioLockGuideRef(),
    );

    // result — the raw 50x50 drag does not match the armed file's 2:1 ratio, so it must be locked
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should arm the next queued file and stay on the media tool instead of reverting to default', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const armedRef = createArmedRef(armed);
    const nextFile = new File(['x'], 'next.png', { type: 'image/png' });
    const nodeId = createMediaNode({ height: 100, width: 200, x: -90, y: -40 });

    store.dispatch(setActiveTool(ToolName.media));

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createCanvasRefs(),
      armedRef,
      createStartRef({ x: 10, y: 10 }),
      { current: nodeId },
      { current: null },
      createQueueRef([nextFile]),
      createAspectRatioLockGuideRef(),
    );

    // result — armedRef is reassigned asynchronously by armNextFile once the next file's Image
    // decodes, but the tool must stay on media rather than reverting to default immediately
    expect(store.getState().design.activeTool).toBe(ToolName.media);
  });

  it('should determine a click vs. a drag using a freshly read viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const nodeId = createMediaNode({ height: 100, width: 200, x: -240, y: -130 });

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before — startRef holds a world-space point, e.g. what handlePointerDown would have already
    // recorded for screen (10,10) under this same viewport
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createCanvasRefs(),
      createArmedRef(armed),
      createStartRef({ x: -140, y: -80 }),
      { current: nodeId },
      { current: null },
      createQueueRef(),
      createAspectRatioLockGuideRef(),
    );

    // result — screen (10,10) under viewport {x:150,y:90} converts to world (-140,-80), exactly
    // matching the recorded start point (zero delta), so this resolves as a click and the node's
    // already-centered rect from pointer-down is left untouched — proving the viewport was read
    // fresh at call time, not a stale one
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ x: -240, y: -130 });
  });
});
