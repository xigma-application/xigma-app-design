import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { FC, RefObject } from 'react';

// components
import ClassNamesProvider from '../../../core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';
import { useGuideTool } from './useGuideTool';

// store
import { selectActivePage, selectAreRulersVisible } from 'store/design/selectors';
import { addGuide, setActiveTool, setViewport, toggleRulers } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs, TGuideRefs } from 'types/design/canvas/types';
import { TUseGuideTool } from './types';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number): PointerEvent => new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1 });

let capturedClassName: string | null = null;

const ClassNameProbe: FC = () => {
  capturedClassName = useClassNames().className;
  return null;
};

const renderGuideTool = (canvasRef: RefObject<HTMLCanvasElement | null>): { guideRefs: TGuideRefs; result: { current: TUseGuideTool } } => {
  const refs: TCanvasRefs = createCanvasRefs({ canvasRef });

  const { result } = renderHook(() => useGuideTool(refs), {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ClassNamesProvider>
          {children}
          <ClassNameProbe />
        </ClassNamesProvider>
      </Provider>
    ),
  });

  return { guideRefs: refs.guides, result };
};

describe('useGuideTool behaviors', () => {
  beforeEach(() => {
    capturedClassName = null;
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
    const { guideRefs } = renderGuideTool(canvasRef);

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
    const { guideRefs } = renderGuideTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 5, 100));
    });

    // result
    expect(guideRefs.draggingGuideRef.current).toEqual({ axis: 'x', frameId: null, hasMoved: false, id: null, position: 5 });
  });

  it('should abandon an in-progress drag when the tool switches away mid-gesture', () => {
    // mock
    const canvasRef = createCanvasRef();
    const { guideRefs } = renderGuideTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 5));
    });

    expect(guideRefs.draggingGuideRef.current).not.toBeNull();

    // action
    act(() => store.dispatch(setActiveTool(ToolName.hand)));

    // result
    expect(guideRefs.draggingGuideRef.current).toBeNull();
  });

  it('should set the resize-x class name while hovering the left gutter', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderGuideTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5, 100));
    });

    // result
    expect(capturedClassName).toBe('resize-x');
  });

  it('should clear the class name when the tool switches away', () => {
    // mock
    const canvasRef = createCanvasRef();
    renderGuideTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5, 100));
    });

    expect(capturedClassName).toBe('resize-x');

    // action
    act(() => store.dispatch(setActiveTool(ToolName.hand)));

    // result
    expect(capturedClassName).toBeNull();
  });

  it('should select an existing guide on a plain click, then remove it via removeSelectedGuide', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 40 }));
    const [guide] = selectActivePage(store.getState()).guides.filter((candidate) => candidate.position === 40);
    const canvasRef = createCanvasRef();

    // before
    const { result } = renderGuideTool(canvasRef);

    // action — a plain click, no movement in between
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 40, 200));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 40, 200));
    });

    // result
    expect(result.current.selectedGuide).toEqual({ frameId: null, id: guide.id, worldPoint: { x: 40, y: 200 } });

    // action
    act(() => result.current.removeSelectedGuide());

    // result
    expect(selectActivePage(store.getState()).guides.find((candidate) => candidate.id === guide.id)).toBeUndefined();
    expect(result.current.selectedGuide).toBeNull();
  });

  it('should do nothing when removeSelectedGuide is called without a selection', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 40 }));
    const guidesBefore = selectActivePage(store.getState()).guides;
    const canvasRef = createCanvasRef();

    // before
    const { result } = renderGuideTool(canvasRef);

    // action
    act(() => result.current.removeSelectedGuide());

    // result
    expect(selectActivePage(store.getState()).guides).toEqual(guidesBefore);
  });

  it('should deselect the guide when starting a new pointerdown elsewhere', () => {
    // mock
    store.dispatch(addGuide({ axis: 'x', frameId: null, position: 40 }));
    const canvasRef = createCanvasRef();
    const { result } = renderGuideTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 40, 200));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 40, 200));
    });

    expect(result.current.selectedGuide).not.toBeNull();

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 300, 300));
    });

    // result
    expect(result.current.selectedGuide).toBeNull();
  });
});
