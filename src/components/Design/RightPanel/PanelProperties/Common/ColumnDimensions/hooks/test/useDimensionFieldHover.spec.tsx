import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useDimensionFieldHover } from '../useDimensionFieldHover';

// store
import { setHoveredDimensionField } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const readField = (): ReturnType<typeof store.getState>['design']['hoveredDimensionField'] => store.getState().design.hoveredDimensionField;

describe('useDimensionFieldHover', () => {
  afterEach(() => {
    store.dispatch(setHoveredDimensionField(null));
  });

  it('should publish the field on mouse enter and clear it on mouse leave', () => {
    const { result } = renderHook(() => useDimensionFieldHover('maxWidth'), { wrapper });

    act(() => result.current.onMouseEnter());
    expect(readField()).toBe('maxWidth');

    act(() => result.current.onMouseLeave());
    expect(readField()).toBeNull();
  });

  it('should publish whichever field it was created with', () => {
    const { result } = renderHook(() => useDimensionFieldHover('minHeight'), { wrapper });

    act(() => result.current.onMouseEnter());

    expect(readField()).toBe('minHeight');
  });
});
