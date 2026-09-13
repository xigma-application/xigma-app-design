import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useFaceBlendModeButton } from '../useFaceBlendModeButton';

// store
import { DEFAULT_VECTOR_PAINT } from 'store/design/constants';
import { selectPaint } from 'store/design/selectors';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

// types
import { BlendMode } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseFaceBlendModeButton = (): ReturnType<typeof renderHook<ReturnType<typeof useFaceBlendModeButton>, unknown>> =>
  renderHook(() => useFaceBlendModeButton(), { wrapper });

describe('useFaceBlendModeButton', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_VECTOR_PAINT));
  });

  it('should default to Normal, the DropEmpty icon, and closed', () => {
    // before
    const { result } = renderUseFaceBlendModeButton();

    // result
    expect(result.current.value).toBe(BlendMode.normal);
    expect(result.current.isDefault).toBe(true);
    expect(result.current.icon).toBe('DropEmpty');
    expect(result.current.open).toBe(false);
  });

  it('should toggle open state via onOpenChange', () => {
    // before
    const { result } = renderUseFaceBlendModeButton();

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);

    // action
    act(() => result.current.onOpenChange(false));

    // result
    expect(result.current.open).toBe(false);
  });

  it('should switch to the DropFilled icon once a real blend mode is set on the tool paint', () => {
    // before
    store.dispatch(setPaint({ ...DEFAULT_VECTOR_PAINT, blendMode: BlendMode.multiply }));

    const { result } = renderUseFaceBlendModeButton();

    // result
    expect(result.current.value).toBe(BlendMode.multiply);
    expect(result.current.isDefault).toBe(false);
    expect(result.current.icon).toBe('DropFilled');
  });

  it('should dispatch the picked blend mode onto the tool paint', () => {
    // before
    const { result } = renderUseFaceBlendModeButton();

    // action
    act(() => result.current.selectBlendMode(BlendMode.screen)());

    // result
    expect(selectPaint(store.getState()).blendMode).toBe(BlendMode.screen);
  });
});
