import { Provider } from 'react-redux';
import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useCommentTool } from './useCommentTool';

// store
import { cancelCommentDraft, setActiveTool, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent(type, { button, clientX: x, clientY: y, pointerId: 1 });

const renderCommentTool = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useCommentTool(createCanvasRefs({ canvasRef })), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useCommentTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(cancelCommentDraft());
  });

  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderCommentTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should start a comment draft at the clicked world position', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    renderCommentTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 20));

    // result
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should clear any existing selection when starting a draft', () => {
    // mock
    store.dispatch(setSelection(['existing-node']));
    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    renderCommentTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 20));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    renderCommentTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 20, 1));

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should not replace an already-open draft with a new one from a second click', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    renderCommentTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 20));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 50, 60));

    // result
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });
});
