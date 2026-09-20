import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useIgnoreProgressiveBlurInteractOutside } from './useIgnoreProgressiveBlurInteractOutside';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <CanvasRefsProvider>{children}</CanvasRefsProvider>;

const renderIgnore = (): ReturnType<
  typeof renderHook<{ handler: TFunc<[Event]>; refs: ReturnType<typeof useCanvasRefsContext> }, unknown>
> => renderHook(() => ({ handler: useIgnoreProgressiveBlurInteractOutside(), refs: useCanvasRefsContext() }), { wrapper });

const createCanvasEvent = (): Event => {
  const event = new Event('pointerdown', { cancelable: true });

  Object.defineProperty(event, 'target', { value: document.createElement('canvas') });

  return event;
};

describe('useIgnoreProgressiveBlurInteractOutside', () => {
  it('should keep the panel open when the canvas is pressed while a handle is hovered', () => {
    // before
    const { result } = renderIgnore();
    const event = createCanvasEvent();

    result.current.refs.progressiveBlur.hoveredEndpointRef.current = 'start';

    // action
    result.current.handler(event);

    // result
    expect(event.defaultPrevented).toBe(true);
  });

  it('should keep the panel open while a handle is being dragged', () => {
    // before
    const { result } = renderIgnore();
    const event = createCanvasEvent();

    result.current.refs.progressiveBlur.dragRef.current = { effectIndex: 0, endpoint: 'end', nodeId: 'n1' };

    // action
    result.current.handler(event);

    // result
    expect(event.defaultPrevented).toBe(true);
  });

  it('should let a canvas press dismiss the panel when no handle is involved, and ignore non-canvas targets', () => {
    // before
    const { result } = renderIgnore();
    const canvasEvent = createCanvasEvent();
    const otherEvent = new Event('pointerdown', { cancelable: true });

    // action
    result.current.handler(canvasEvent);
    result.current.refs.progressiveBlur.hoveredEndpointRef.current = 'start';
    result.current.handler(otherEvent);

    // result
    expect(canvasEvent.defaultPrevented).toBe(false);
    expect(otherEvent.defaultPrevented).toBe(false);
  });
});
