import { KeyboardEvent, ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useHandleZoomInputCommit } from '../useHandleZoomInputCommit';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

const canvas = document.createElement('canvas');

vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);

const canvasRefs = createCanvasRefs({ canvasRef: { current: canvas } });

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={canvasRefs}>{children}</CanvasRefsContext.Provider>
  </Provider>
);

const buildEvent = (key: string, value: string): KeyboardEvent<HTMLInputElement> =>
  ({ currentTarget: { blur: vi.fn(), value }, key }) as unknown as KeyboardEvent<HTMLInputElement>;

describe('useHandleZoomInputCommit', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should ignore keys other than Enter', () => {
    // mock
    const setValue = vi.fn();

    // before
    const { result } = renderHook(() => useHandleZoomInputCommit(setValue), { wrapper });

    // action
    result.current(buildEvent('a', '250'));

    // result
    expect(setValue).not.toHaveBeenCalled();
  });

  it('should clamp a non-numeric entry to the minimum zoom on Enter', () => {
    // mock
    const setValue = vi.fn();

    // before
    const { result } = renderHook(() => useHandleZoomInputCommit(setValue), { wrapper });

    // action
    result.current(buildEvent('Enter', ''));

    // result
    expect(setValue).toHaveBeenCalledWith('10');
  });
});
