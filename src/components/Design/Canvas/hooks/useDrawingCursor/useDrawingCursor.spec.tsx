import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useDrawingCursor } from './useDrawingCursor';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => ({ current: document.createElement('canvas') });

const renderDrawingCursor = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useDrawingCursor(canvasRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useDrawingCursor behaviors', () => {
  beforeEach(() => {
    // reset the singleton store's active tool, since it otherwise leaks between tests in this file
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should apply the drawing cursor class when the Frame tool is active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.frame));

    // before
    renderDrawingCursor(canvasRef);

    // result
    expect(canvasRef.current?.className).toContain('drawing');
  });

  it('should apply the drawing cursor class for every tool in the Rectangle group', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.star));

    // before
    renderDrawingCursor(canvasRef);

    // result
    expect(canvasRef.current?.className).toContain('drawing');
  });

  it('should not apply the drawing cursor class for the default tool', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDrawingCursor(canvasRef);

    // result
    expect(canvasRef.current?.className).not.toContain('drawing');
  });

  it('should remove the drawing cursor class once switching away from a drawing tool', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.rectangle));

    // before
    renderDrawingCursor(canvasRef);

    expect(canvasRef.current?.className).toContain('drawing');

    // action
    act(() => store.dispatch(setActiveTool(ToolName.default)));

    // result
    expect(canvasRef.current?.className).not.toContain('drawing');
  });

  it('should do nothing when the canvas has no element yet', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderDrawingCursor(canvasRef)).not.toThrow();
  });
});
