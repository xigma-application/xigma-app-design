import { act, fireEvent, renderHook } from '@testing-library/react';

// hooks
import { useResizeHandler } from './useResizeHandler';

// types
import { MouseButton } from 'types/enums';
import { TResizeHandlerSettings } from './types';

const maxHeight = 1000;
const maxWidth = 1000;
const minHeight = 250;
const minWidth = 250;

const createSettings = (overrides: Partial<TResizeHandlerSettings> = {}): TResizeHandlerSettings => ({
  initialHeight: 0,
  initialWidth: 0,
  isInitiallyInvertedX: false,
  isInitiallyInvertedY: false,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  ...overrides,
});

const createRef = (): { current: { getBoundingClientRect: () => DOMRect } } =>
  ({
    current: {
      getBoundingClientRect: () => ({ bottom: 0, left: 0, right: 0, top: 0 }) as DOMRect,
    },
  }) as unknown as { current: { getBoundingClientRect: () => DOMRect } };

const getCursorOverlay = (): HTMLElement | undefined =>
  Array.from(document.body.children).find((child): child is HTMLElement => (child as HTMLElement).style.zIndex === '999999');

describe('useResizeHandler behaviors', () => {
  it('should resize width', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.width).toBe(500);
  });

  it('should resize width inverted, measuring from the panel’s right edge', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, true);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.width).toBe(500);
  });

  it('should clamp to min width when dragged below it', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 500 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 0 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.width).toBe(minWidth);
  });

  it('should clamp to max width when dragged above it', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 500 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 1500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.width).toBe(maxWidth);
  });

  it('should not resize width when a non-primary mouse button is held', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.middle } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.width).toBe(250);
  });

  it('should resize height', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialHeight: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownY({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientY: 500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.height).toBe(500);
  });

  it('should resize height inverted, measuring from the panel’s bottom edge', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialHeight: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownY({ button: MouseButton.primary } as never, true);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientY: 500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.height).toBe(500);
  });

  it('should clamp to min height when dragged below it', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialHeight: 500 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownY({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientY: 0 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.height).toBe(minHeight);
  });

  it('should clamp to max height when dragged above it', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialHeight: 500 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownY({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientY: 1500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.height).toBe(maxHeight);
  });

  it('should not resize height when a non-primary mouse button is held', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialHeight: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownY({ button: MouseButton.middle } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientY: 500 });
      fireEvent.mouseUp(document);
    });

    // result
    expect(result.current.height).toBe(250);
  });

  it('should stop resizing and restore the cursor once the mouse button is released', () => {
    // mock
    const ref = createRef();

    // before — start strictly between min/max, so both drag directions are still available
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 500 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });

    // result — mid-drag
    expect(result.current.isPressingX).toBe(true);
    expect(getCursorOverlay()?.style.cursor).toBe('ew-resize');

    // action
    act(() => {
      fireEvent.mouseUp(document);
    });

    // result — released, overlay removed
    expect(result.current.isPressingX).toBe(false);
    expect(getCursorOverlay()).toBeUndefined();
  });

  it('should switch the cursor to e-resize once the drag reaches the min width', () => {
    // mock
    const ref = createRef();

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 500 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: minWidth });
    });

    // result
    expect(result.current.width).toBe(minWidth);
    expect(getCursorOverlay()?.style.cursor).toBe('e-resize');
  });

  it('should already show the boundary-aware cursor on mousedown when starting exactly at the min width', () => {
    // mock
    const ref = createRef();

    // before — panel starts at the min width already (e.g. RightPanel's default)
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: minWidth }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });

    // result — no mousemove happened yet, cursor must already reflect the boundary
    expect(getCursorOverlay()?.style.cursor).toBe('e-resize');
  });

  it('should reflect the initial invert flag in cursorX before any mousedown has happened, e.g. a right-anchored panel', () => {
    // mock
    const ref = createRef();

    // before — right-anchored panel starting at its min width, never yet pressed
    const { result } = renderHook(() =>
      useResizeHandler(createSettings({ initialWidth: minWidth, isInitiallyInvertedX: true }), ref as never),
    );

    // result — inverted at min width: only growing left (w-resize) has effect
    expect(result.current.cursorX).toBe('w-resize');
  });

  it('should fall back to a zero-origin rect for width when the ref has no current element yet', () => {
    // mock
    const ref = { current: null };

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialWidth: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownX({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 500 });
      fireEvent.mouseUp(document);
    });

    // result — position falls back to clientX - 0
    expect(result.current.width).toBe(500);
  });

  it('should fall back to a zero-origin rect for height when the ref has no current element yet', () => {
    // mock
    const ref = { current: null };

    // before
    const { result } = renderHook(() => useResizeHandler(createSettings({ initialHeight: 250 }), ref as never));

    // action
    act(() => {
      result.current.onMouseDownY({ button: MouseButton.primary } as never, false);
    });
    act(() => {
      fireEvent.mouseMove(document, { clientY: 500 });
      fireEvent.mouseUp(document);
    });

    // result — position falls back to clientY - 0
    expect(result.current.height).toBe(500);
  });
});
