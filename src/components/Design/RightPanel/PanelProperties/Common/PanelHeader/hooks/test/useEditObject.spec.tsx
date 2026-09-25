import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useEditObject } from '../useEditObject';

// store
import { store } from 'store';

const enterMock = vi.fn();
const refs = { canvasRef: { current: null } };

vi.mock('components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext', () => ({ useCanvasRefsContext: (): unknown => refs }));
vi.mock('components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleEnterVectorEdit/handleEnterVectorEdit', () => ({
  handleEnterVectorEdit: (...args: unknown[]): unknown => enterMock(...args),
}));

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useEditObject', () => {
  it('should enter vector edit with the canvas refs', () => {
    // before
    const { result } = renderHook(() => useEditObject(), { wrapper });

    // action
    result.current();

    // result
    expect(enterMock).toHaveBeenCalledWith(store.dispatch, refs);
  });
});
