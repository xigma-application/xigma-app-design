import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useGuideTool } from './useGuideTool';

// store
import { selectActivePage, selectAreRulersVisible } from 'store/design/selectors';
import { setActiveTool, setViewport, toggleRulers } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs, TGuideRefs } from 'types/design/canvas/types';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number): PointerEvent => new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1 });

const renderGuideTool = (canvasRef: RefObject<HTMLCanvasElement | null>): TGuideRefs => {
  const refs: TCanvasRefs = createCanvasRefs({ canvasRef });

  renderHook(() => useGuideTool(refs), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

  return refs.guides;
};

describe('useGuideTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    if (!selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should drag a new page guide out of the top ruler gutter and commit it on release', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    const guideRefs = renderGuideTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 5));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 100, 80));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 80));
    });

    // result
    expect(selectActivePage(store.getState()).guides).toContainEqual({ axis: 'y', id: expect.any(String), position: 80 });
    expect(guideRefs.draggingGuideRef.current).toBeNull();
  });

  it('should not react to pointer events when neither the default nor scale tool is active', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.hand));
    const canvasRef = createCanvasRef();
    const guidesBefore = selectActivePage(store.getState()).guides;

    // before
    renderGuideTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 5));

    // result
    expect(selectActivePage(store.getState()).guides).toEqual(guidesBefore);
  });

  it('should also react while the scale tool is active', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.scale));
    const canvasRef = createCanvasRef();

    // before
    const guideRefs = renderGuideTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 5, 100));
    });

    // result
    expect(guideRefs.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, id: null, position: 5 });
  });

  it('should abandon an in-progress drag when the tool switches away mid-gesture', () => {
    // mock
    const canvasRef = createCanvasRef();
    const guideRefs = renderGuideTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 5));
    });

    expect(guideRefs.draggingGuideRef.current).not.toBeNull();

    // action
    act(() => store.dispatch(setActiveTool(ToolName.hand)));

    // result
    expect(guideRefs.draggingGuideRef.current).toBeNull();
  });
});
