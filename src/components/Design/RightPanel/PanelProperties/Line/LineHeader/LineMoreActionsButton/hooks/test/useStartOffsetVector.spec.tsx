import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useStartOffsetVector } from '../useStartOffsetVector';

// store
import { setOffsetVector, setSelection } from 'store/design/slice';
import { selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { StrokeJoin } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useStartOffsetVector', () => {
  afterEach(() => {
    store.dispatch(setOffsetVector(null));
    store.dispatch(setSelection([]));
  });

  it('should start offsetting the one selected line by 20 with sharp corners', () => {
    // mock
    store.dispatch(setSelection(['lineA']));

    // before
    const { result } = renderHook(() => useStartOffsetVector(), { wrapper });

    // action
    act(() => result.current.onStart());

    // result
    expect(result.current.canStart).toBe(true);
    expect(selectOffsetVector(store.getState())).toEqual({ distance: 20, join: StrokeJoin.miter, nodeId: 'lineA' });
  });

  it('should not offer an offset for several selected lines', () => {
    // mock
    store.dispatch(setSelection(['lineA', 'lineB']));

    // before
    const { result } = renderHook(() => useStartOffsetVector(), { wrapper });

    // result
    expect(result.current.canStart).toBe(false);
  });
});
