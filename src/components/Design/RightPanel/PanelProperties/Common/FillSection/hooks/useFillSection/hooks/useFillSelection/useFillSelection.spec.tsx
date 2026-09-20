import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useFillSelection } from './useFillSelection';

// store
import { setSelectedFillIndices, setSelectedStrokeIndices } from 'store/design/slice';
import { store } from 'store';

const noMods = { meta: false, shift: false };

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseFillSelection = (count: number): ReturnType<typeof renderHook<ReturnType<typeof useFillSelection>, { count: number }>> =>
  renderHook(({ count }) => useFillSelection(count), { initialProps: { count }, wrapper });

describe('useFillSelection', () => {
  afterEach(() => {
    store.dispatch(setSelectedFillIndices([]));
    store.dispatch(setSelectedStrokeIndices([]));
  });

  it('should start with an empty selection', () => {
    const { result } = renderUseFillSelection(4);

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should keep the fill and stroke selections separate, and an empty stroke list must not trim the fill selection', () => {
    // before
    const fills = renderUseFillSelection(1);
    const strokes = renderHook(() => useFillSelection(0, 'strokes'), { wrapper });

    // action
    act(() => fills.result.current.onSelectRow(0, noMods));

    // result
    expect(fills.result.current.selectedIndices).toEqual([0]);
    expect(strokes.result.current.selectedIndices).toEqual([]);
  });

  it('should replace the selection on a plain click', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.onSelectRow(2, noMods));

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should toggle an index with the meta modifier', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    act(() => result.current.onSelectRow(3, { meta: true, shift: false }));

    expect(result.current.selectedIndices).toEqual([1, 3]);

    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));

    expect(result.current.selectedIndices).toEqual([3]);
  });

  it('should select an inclusive range with the shift modifier once an anchor exists', () => {
    const { result } = renderUseFillSelection(6);

    act(() => result.current.onSelectRow(1, noMods));
    act(() => result.current.onSelectRow(4, { meta: false, shift: true }));

    expect(result.current.selectedIndices).toEqual([1, 2, 3, 4]);
  });

  it('should fall back to a plain select when shift is held with no anchor', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.onSelectRow(2, { meta: false, shift: true }));

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should clear the selection', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.onSelectRow(2, noMods));
    act(() => result.current.clearSelection());

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should be a no-op to clear an already-empty selection', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.clearSelection());

    expect(result.current.selectedIndices).toEqual([]);
  });

  it('should replace the selection outright via setSelection, anchoring on its last index', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.setSelection([1, 3]));

    expect(result.current.selectedIndices).toEqual([1, 3]);

    // result — the anchor moved to the last given index (3), so a further shift-click ranges from there
    act(() => result.current.onSelectRow(0, { meta: false, shift: true }));

    expect(result.current.selectedIndices).toEqual([0, 1, 2, 3]);
  });

  it('should clear the anchor when setSelection is given an empty array', () => {
    const { result } = renderUseFillSelection(4);

    act(() => result.current.setSelection([]));

    expect(result.current.selectedIndices).toEqual([]);

    // result — with no anchor, a shift-click falls back to a plain select instead of ranging
    act(() => result.current.onSelectRow(2, { meta: false, shift: true }));

    expect(result.current.selectedIndices).toEqual([2]);
  });

  it('should drop indices that fall outside a shrunken fill count', () => {
    const { result, rerender } = renderUseFillSelection(4);

    act(() => result.current.onSelectRow(3, { meta: true, shift: false }));
    act(() => result.current.onSelectRow(1, { meta: true, shift: false }));
    rerender({ count: 2 });

    expect(result.current.selectedIndices).toEqual([1]);
  });
});
