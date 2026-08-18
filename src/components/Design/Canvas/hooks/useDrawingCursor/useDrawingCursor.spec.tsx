import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// components
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useClassNames } from 'components/Design/core/ClassNamesProvider/hooks/useClassNames';
import { useDrawingCursor } from './useDrawingCursor';
import { useHandTool } from '../useHandTool/useHandTool';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => ({ current: document.createElement('canvas') });

const renderDrawingCursor = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<string | null> => {
  const classNameRef: RefObject<string | null> = { current: null };

  renderHook(
    () => {
      useDrawingCursor(createCanvasRefs({ canvasRef }));
      classNameRef.current = useClassNames().className;
    },
    {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    },
  );

  return classNameRef;
};

describe('useDrawingCursor behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should apply the drawing cursor class when the Frame tool is active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.frame));

    // before
    const classNameRef = renderDrawingCursor(canvasRef);

    // result
    expect(classNameRef.current).toBe('drawing');
  });

  it('should apply the drawing cursor class for every tool in the Rectangle group', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.star));

    // before
    const classNameRef = renderDrawingCursor(canvasRef);

    // result
    expect(classNameRef.current).toBe('drawing');
  });

  it('should not apply the drawing cursor class for the default tool', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    const classNameRef = renderDrawingCursor(canvasRef);

    // result
    expect(classNameRef.current).not.toBe('drawing');
  });

  it('should remove the drawing cursor class once switching away from a drawing tool', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.rectangle));

    // before
    const classNameRef = renderDrawingCursor(canvasRef);

    expect(classNameRef.current).toBe('drawing');

    // action
    act(() => store.dispatch(setActiveTool(ToolName.default)));

    // result
    expect(classNameRef.current).not.toBe('drawing');
  });

  it('should do nothing when the canvas has no element yet', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderDrawingCursor(canvasRef)).not.toThrow();
  });

  it("should not clobber the Hand tool's own cursor class when the Hand tool is active", () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    const classNameRef: RefObject<string | null> = { current: null };

    // before
    renderHook(
      () => {
        useHandTool(createCanvasRefs({ canvasRef }));
        useDrawingCursor(createCanvasRefs({ canvasRef }));
        classNameRef.current = useClassNames().className;
      },
      {
        wrapper: ({ children }) => (
          <Provider store={store}>
            <ClassNamesProvider>{children}</ClassNamesProvider>
          </Provider>
        ),
      },
    );

    // result
    expect(classNameRef.current).toBe('hand');
  });
});
