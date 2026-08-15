import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useDrawMediaTool, TMediaToolConfig } from './useDrawMediaTool';

// store
import designReducer, { setActiveTool, setSelection, setViewport } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDraftEntity } from 'types/design/types';

type TFakeImage = { naturalHeight: number; naturalWidth: number; onload: (() => void) | null; src: string };

const CONFIG: TMediaToolConfig = { name: 'Image', tool: ToolName.media };

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  // jsdom doesn't implement pointer capture on elements
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const stubImageConstructor = (): { getImages: () => TFakeImage[]; getLastImage: () => TFakeImage } => {
  const images: TFakeImage[] = [];

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      const image: TFakeImage = { naturalHeight: 0, naturalWidth: 0, onload: null, src: '' };

      images.push(image);

      return image;
    }),
  );

  return { getImages: () => images, getLastImage: () => images[images.length - 1] };
};

const captureInput = (): { getInput: () => HTMLInputElement } => {
  const originalCreateElement = document.createElement.bind(document);
  let capturedInput: HTMLInputElement | null = null;

  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    const element = originalCreateElement(tagName);

    if (tagName === 'input') {
      capturedInput = element as HTMLInputElement;
      vi.spyOn(capturedInput, 'click').mockImplementation(() => undefined);
    }

    return element;
  });

  return {
    getInput: (): HTMLInputElement => {
      if (!capturedInput) {
        throw new Error('input was not created');
      }

      return capturedInput;
    },
  };
};

const selectFile = (input: HTMLInputElement, files: File[] | null): void => {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  input.dispatchEvent(new Event('change'));
};

const armMedia = (input: HTMLInputElement, getLastImage: () => TFakeImage, naturalWidth: number, naturalHeight: number): void => {
  selectFile(input, [new File(['x'], 'photo.png', { type: 'image/png' })]);

  const image = getLastImage();

  image.naturalWidth = naturalWidth;
  image.naturalHeight = naturalHeight;
  image.onload?.();
};

const pointerEvent = (type: string, x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent(type, { button, clientX: x, clientY: y, pointerId: 1 });

const renderMediaTool = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draftRef: RefObject<TDraftEntity | null>,
  store: EnhancedStore<{ design: TDesignState }>,
): void => {
  renderHook(() => useDrawMediaTool(canvasRef, draftRef, CONFIG), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useDrawMediaTool behaviors', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should not open a file picker when the tool is not active', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getInput } = captureInput();

    // before
    renderMediaTool(canvasRef, draftRef, store);

    // result
    expect(() => getInput()).toThrow();
  });

  it('should open an image and video file picker as soon as the tool activates', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));

    // before
    renderMediaTool(canvasRef, draftRef, store);

    // result
    const input = getInput();

    expect(input.accept).toBe('image/*,video/*');
    expect(input.click).toHaveBeenCalledTimes(1);
  });

  it('should revert to the default tool when the file picker is cancelled', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    // action
    act(() => getInput().dispatchEvent(new Event('cancel')));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should ignore a change event with no file selected', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    // action
    selectFile(getInput(), null);
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(store.getState().design.rootOrder).toHaveLength(0);
  });

  it('should not react to pointer events before a file is chosen', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    captureInput();
    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 60));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should ignore a non-primary button press once armed', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 1));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 60, 1));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should not crash when arming a file while the canvas ref is unavailable', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    const canvas = canvasRef.current;

    canvasRef.current = null;

    // action / result
    expect(() => selectFile(getInput(), [new File(['x'], 'photo.png', { type: 'image/png' })])).not.toThrow();

    canvasRef.current = canvas;
  });

  it('should not crash when the composite cursor becomes ready after the canvas ref is unavailable', async () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getImages, getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    const [, crosshairImage, thumbnailImage] = getImages();

    canvasRef.current = null;

    // action
    crosshairImage.onload?.();
    thumbnailImage.onload?.();

    // result — nothing to assert beyond "this doesn't throw"
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  it('should set a composite crosshair+thumbnail cursor on the canvas once armed', async () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getImages, getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();
    const drawImage = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    // jsdom's CSS parser rejects the `-webkit-image-set(...)` cursor syntax as invalid and
    // silently no-ops the assignment (real browsers accept it fine — this is purely a jsdom
    // limitation), so swap in a plain mutable object to observe the assigned value directly
    Object.defineProperty(canvasRef.current, 'style', { configurable: true, value: { cursor: '' }, writable: true });

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    // before
    armMedia(getInput(), getLastImage, 200, 100);

    // result — no composite yet, only the plain crosshair CSS class applies so far
    expect(canvasRef.current?.style.cursor).toBe('');

    // action — resolve the crosshair + thumbnail images createArmedCursor loaded in the background
    const [, crosshairImage, thumbnailImage] = getImages();

    crosshairImage.onload?.();
    thumbnailImage.onload?.();
    await vi.waitFor(() => expect(canvasRef.current?.style.cursor).not.toBe(''));

    // result
    expect(canvasRef.current?.style.cursor).toBe('-webkit-image-set(url(data:image/png;base64,mock) 8x) 16 16, auto');
    expect(drawImage).toHaveBeenCalledTimes(2);
  });

  it('should show a live aspect-ratio-locked draft while dragging', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 50, 50));

    // result — raw 50x50 drag locked to a 2:1 ratio, driven by the taller raw axis
    expect(draftRef.current).toEqual({ height: 50, src: 'blob:mock-url', type: NodeType.media, width: 100, x: 0, y: 0 });
  });

  it('should place the image at its natural size on a plain click', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(1);
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({
      height: 100,
      name: 'Image',
      src: 'blob:mock-url',
      type: NodeType.media,
      width: 200,
      x: 10,
      y: 10,
    });
    expect(design.activeTool).toBe(ToolName.default);
    expect(draftRef.current).toBeNull();
  });

  it('should place an aspect-ratio-locked custom size on a drag', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 50, 50));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 50, 50));
    });

    // result — the raw 50x50 drag does not match the 2:1 source ratio, so it must be locked
    const { design } = store.getState();

    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should place a click natural-size image, then an aspect-locked dragged image, from a multi-file selection', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    // before — pick two files at once
    selectFile(getInput(), [new File(['a'], 'first.png', { type: 'image/png' }), new File(['b'], 'second.png', { type: 'image/png' })]);

    const firstImage = getLastImage();

    firstImage.naturalWidth = 200;
    firstImage.naturalHeight = 100;
    firstImage.onload?.();

    // action — place the first file with a plain click
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    // result — one node placed, tool stays on media with the second file now armed
    expect(store.getState().design.rootOrder).toHaveLength(1);
    expect(store.getState().design.activeTool).toBe(ToolName.media);

    const secondImage = getLastImage();

    secondImage.naturalWidth = 50;
    secondImage.naturalHeight = 100;
    secondImage.onload?.();

    // action — place the second file with a drag
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 40, 40));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 90, 65));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 90, 65));
    });

    // result — both files placed, tool reverts to default once the queue is empty
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(2);
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ height: 100, width: 200, x: 10, y: 10 });
    // raw 50x25 drag locked to the second file's 1:2 ratio (twice as tall as wide) — the raw
    // height (25) is far too short for that ratio, so it gets forced up to 100
    expect(design.nodes[design.rootOrder[1]]).toMatchObject({ height: 100, width: 50, x: 40, y: 40 });
    expect(design.activeTool).toBe(ToolName.default);
    // both files from the same multi-file pick end up selected together, not just the last one
    expect(design.selectedIds).toEqual([design.rootOrder[0], design.rootOrder[1]]);
  });

  it('should clear a pre-existing selection once when files are picked, then keep every placed file selected as more are placed', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setSelection(['stale-node']));
    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);

    // before — pick two files at once; picking must clear the stale pre-existing selection
    selectFile(getInput(), [new File(['a'], 'first.png', { type: 'image/png' }), new File(['b'], 'second.png', { type: 'image/png' })]);

    expect(store.getState().design.selectedIds).toEqual([]);

    const firstImage = getLastImage();

    firstImage.naturalWidth = 200;
    firstImage.naturalHeight = 100;
    firstImage.onload?.();

    // action — place the first file
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    const { rootOrder: rootOrderAfterFirst, selectedIds: selectedAfterFirst } = store.getState().design;

    expect(selectedAfterFirst).toEqual([rootOrderAfterFirst[0]]);

    const secondImage = getLastImage();

    secondImage.naturalWidth = 200;
    secondImage.naturalHeight = 100;
    secondImage.onload?.();

    // action — place the second file
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 40, 40));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 40, 40));
    });

    // result — the first file's selection is kept, the second is added alongside it
    const { rootOrder, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([rootOrder[0], rootOrder[1]]);
  });

  it('should not reopen the file picker or lose the armed file when the viewport changes (e.g. panning) while armed', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    // action — panning (or scroll-zooming) dispatches setViewport while a file is still armed
    act(() => store.dispatch(setViewport({ x: 150, y: 90, zoom: 1 })));

    // result — the file picker must not reopen, and the still-armed file must still place normally
    expect(getInput().click).toHaveBeenCalledTimes(1);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(1);
    expect(design.viewport).toEqual({ x: 150, y: 90, zoom: 1 });
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ x: -140, y: -80 });
  });

  it('should not place a stale armed file after the tool is deactivated and reactivated without picking a new one', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const { getLastImage } = stubImageConstructor();
    const { getInput } = captureInput();

    store.dispatch(setActiveTool(CONFIG.tool));
    renderMediaTool(canvasRef, draftRef, store);
    armMedia(getInput(), getLastImage, 200, 100);

    // action
    act(() => store.dispatch(setActiveTool(ToolName.default)));
    act(() => store.dispatch(setActiveTool(CONFIG.tool)));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(store.getState().design.rootOrder).toHaveLength(0);
  });
});
