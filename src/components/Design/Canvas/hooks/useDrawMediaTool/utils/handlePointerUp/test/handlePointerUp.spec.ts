import { RefObject } from 'react';

// store
import { setActiveTool, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TArmedMedia } from '../../loadArmedMedia';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
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
const createDraftRef = (): RefObject<TDraftEntity | null> => ({ current: null });
const createQueueRef = (files: File[] = []): RefObject<File[]> => ({ current: files });

const armed: TArmedMedia = { naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' };

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no file is armed', () => {
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
      createArmedRef(null),
      createStartRef({ x: 0, y: 0 }),
      createDraftRef(),
      createQueueRef(),
      'Image',
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
      createArmedRef(armed),
      createStartRef(null),
      createDraftRef(),
      createQueueRef(),
      'Image',
    );

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should place the armed file at its natural size centered on a plain click, reset drag state, and revert to the default tool when the queue is empty', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const draftRef = createDraftRef();
    const startRef = createStartRef({ x: 10, y: 10 });

    draftRef.current = { height: 1, src: 'stale', type: NodeType.media, width: 1, x: 0, y: 0 };

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createArmedRef(armed),
      startRef,
      draftRef,
      createQueueRef(),
      'Image',
    );

    // result — the click point (10,10) lands at the center of the 200x100 image, not its corner
    const { design } = store.getState();
    const page = design.pages[design.activePageId];
    const placed = page.nodes[page.rootOrder[page.rootOrder.length - 1]];

    expect(placed).toMatchObject({ height: 100, name: 'Image', src: 'blob:mock-url', type: NodeType.media, width: 200, x: -90, y: -40 });
    expect(startRef.current).toBeNull();
    expect(draftRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should place an aspect-ratio-locked custom size on a drag', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };

    // before
    handlePointerUp(
      canvas,
      pointerEvent(50, 50),
      store.dispatch,
      store,
      canvasRef,
      createArmedRef(armed),
      createStartRef({ x: 0, y: 0 }),
      createDraftRef(),
      createQueueRef(),
      'Image',
    );

    // result — the raw 50x50 drag does not match the armed file's 2:1 ratio, so it must be locked
    const { design } = store.getState();
    const page = design.pages[design.activePageId];
    const placed = page.nodes[page.rootOrder[page.rootOrder.length - 1]];

    expect(placed).toMatchObject({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should add each newly placed file to the selection, keeping earlier files from the same queue selected too', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };

    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    const selectedBefore = store.getState().design.selectedIds.length;

    // before — place the first file
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createArmedRef(armed),
      createStartRef({ x: 10, y: 10 }),
      createDraftRef(),
      createQueueRef(),
      'Image',
    );

    const rootOrderAfterFirst = store.getState().design.pages[store.getState().design.activePageId].rootOrder;
    const firstId = rootOrderAfterFirst[rootOrderAfterFirst.length - 1];

    expect(store.getState().design.selectedIds.slice(selectedBefore)).toEqual([firstId]);

    // action — place a second file from the same queue
    handlePointerUp(
      canvas,
      pointerEvent(40, 40),
      store.dispatch,
      store,
      canvasRef,
      createArmedRef(armed),
      createStartRef({ x: 40, y: 40 }),
      createDraftRef(),
      createQueueRef(),
      'Image',
    );

    const { rootOrder } = selectActivePage(store.getState());
    const { selectedIds } = store.getState().design;
    const secondId = rootOrder[rootOrder.length - 1];

    // result — both files end up selected together, not just the most recent one
    expect(selectedIds.slice(selectedBefore)).toEqual([firstId, secondId]);
  });

  it('should arm the next queued file and stay on the media tool instead of reverting to default', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };
    const armedRef = createArmedRef(armed);
    const nextFile = new File(['x'], 'next.png', { type: 'image/png' });

    store.dispatch(setActiveTool(ToolName.media));

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      armedRef,
      createStartRef({ x: 10, y: 10 }),
      createDraftRef(),
      createQueueRef([nextFile]),
      'Image',
    );

    // result — armedRef is reassigned asynchronously by armNextFile once the next file's Image
    // decodes, but the tool must stay on media rather than reverting to default immediately
    expect(store.getState().design.activeTool).toBe(ToolName.media);
  });

  it('should convert the pointer position through the current viewport, not a stale one', () => {
    // mock
    const canvas = createCanvas();
    const canvasRef = { current: canvas };

    store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 }));

    // before — startRef holds a world-space point, e.g. what handlePointerDown would have already
    // recorded for screen (10,10) under this same viewport
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      canvasRef,
      createArmedRef(armed),
      createStartRef({ x: -140, y: -80 }),
      createDraftRef(),
      createQueueRef(),
      'Image',
    );

    // result — screen (10,10) under viewport {x:150,y:90} converts to world (-140,-80), exactly
    // matching the recorded start point (zero delta), so this resolves as a click, centered on
    // that world point — proving the viewport was read fresh at call time, not a stale one
    const { design } = store.getState();
    const page = design.pages[design.activePageId];
    const placed = page.nodes[page.rootOrder[page.rootOrder.length - 1]];

    expect(placed).toMatchObject({ x: -240, y: -130 });
  });
});
