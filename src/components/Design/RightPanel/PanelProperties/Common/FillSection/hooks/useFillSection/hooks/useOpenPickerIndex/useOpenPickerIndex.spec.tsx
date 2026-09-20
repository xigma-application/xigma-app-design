import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useOpenPickerIndex } from './useOpenPickerIndex';

// store
import { setOpenPropertyPanel } from 'store/design/slice';
import { store } from 'store';

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const render = <TProps,>(
  hook: (props: TProps) => ReturnType<typeof useOpenPickerIndex>,
  initialProps?: TProps,
): ReturnType<typeof renderHook<ReturnType<typeof useOpenPickerIndex>, TProps>> =>
  renderHook(hook, { initialProps: initialProps as TProps, wrapper: Wrapper });

describe('useOpenPickerIndex', () => {
  afterEach(() => {
    store.dispatch(setOpenPropertyPanel(null));
  });

  it('should start with no open picker when no initial index is given', () => {
    // before
    const { result } = render(() => useOpenPickerIndex('node-1', 'fills', null));

    // result
    expect(result.current.openPickerIndex).toBeNull();
  });

  it('should open the initial index on mount (resuming a fill-picker focus)', () => {
    // before
    const { result } = render(() => useOpenPickerIndex('node-1', 'fills', 2));

    // result
    expect(result.current.openPickerIndex).toBe(2);
  });

  it('should record which index opened its picker', () => {
    // before
    const { result } = render(() => useOpenPickerIndex('node-1', 'fills', null));

    // action
    act(() => result.current.onPickerOpenChange(2, true));

    // result
    expect(result.current.openPickerIndex).toBe(2);
  });

  it('should switch the open index when a different row opens, without needing an explicit close first', () => {
    // before
    const { result } = render(() => useOpenPickerIndex('node-1', 'fills', null));

    act(() => result.current.onPickerOpenChange(0, true));

    // action
    act(() => result.current.onPickerOpenChange(1, true));

    // result
    expect(result.current.openPickerIndex).toBe(1);
  });

  it('should clear the open index when the current owner closes', () => {
    // before
    const { result } = render(() => useOpenPickerIndex('node-1', 'fills', null));

    act(() => result.current.onPickerOpenChange(1, true));

    // action
    act(() => result.current.onPickerOpenChange(1, false));

    // result
    expect(result.current.openPickerIndex).toBeNull();
  });

  it('should ignore a stale close from a row that is no longer the owner', () => {
    // before
    const { result } = render(() => useOpenPickerIndex('node-1', 'fills', null));

    act(() => result.current.onPickerOpenChange(0, true));
    act(() => result.current.onPickerOpenChange(1, true));

    // action — fill 0's own close arrives late, after fill 1 already took over
    act(() => result.current.onPickerOpenChange(0, false));

    // result
    expect(result.current.openPickerIndex).toBe(1);
  });

  it('should keep only one panel open across fills, strokes and effects', () => {
    // before
    const fills = render(() => useOpenPickerIndex('node-1', 'fills', null));
    const strokes = render(() => useOpenPickerIndex('node-1', 'strokes', null));
    const effects = render(() => useOpenPickerIndex('node-1', 'effects', null));

    // action — open a fill panel, then a stroke panel, then an effect panel
    act(() => fills.result.current.onPickerOpenChange(0, true));
    expect(fills.result.current.openPickerIndex).toBe(0);

    act(() => strokes.result.current.onPickerOpenChange(1, true));
    expect(fills.result.current.openPickerIndex).toBeNull();
    expect(strokes.result.current.openPickerIndex).toBe(1);

    act(() => effects.result.current.onPickerOpenChange(0, true));

    // result
    expect(strokes.result.current.openPickerIndex).toBeNull();
    expect(effects.result.current.openPickerIndex).toBe(0);
  });
});
