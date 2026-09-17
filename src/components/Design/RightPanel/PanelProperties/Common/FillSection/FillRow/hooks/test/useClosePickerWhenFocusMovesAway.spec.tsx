import { renderHook } from '@testing-library/react';

// hooks
import { useClosePickerWhenFocusMovesAway } from '../useClosePickerWhenFocusMovesAway';

describe('useClosePickerWhenFocusMovesAway', () => {
  it('should not signal a close when the focus points at this same fill', () => {
    // before
    const { result } = renderHook(() =>
      useClosePickerWhenFocusMovesAway(true, 'node-1', 0, true, true, { nodeId: 'node-1', paintIndex: 0 }),
    );

    // result
    expect(result.current).toBeUndefined();
  });

  it('should not signal a close for a freshly opened fill whose own focus has not landed in the store yet (regression: same-render race where a fill closed itself right as it was claiming focus)', () => {
    // before — this fill just turned isPickerOpen/isImageTabActive true, but the store still
    // reflects the previous fill's focus, since useSyncImageEditor's dispatch to claim it lands a
    // render later
    const { result } = renderHook(() =>
      useClosePickerWhenFocusMovesAway(true, 'node-1', 1, true, true, { nodeId: 'node-1', paintIndex: 0 }),
    );

    // result — never having held focus before, this fill must not close itself while claiming it
    expect(result.current).toBeUndefined();
  });

  it('should not signal a close when the picker is not open', () => {
    // before
    const { result } = renderHook(() =>
      useClosePickerWhenFocusMovesAway(true, 'node-1', 0, false, false, { nodeId: 'node-1', paintIndex: 1 }),
    );

    // result
    expect(result.current).toBeUndefined();
  });

  it('should not signal a close when the picker is open but not on the Image tab', () => {
    // before
    const { rerender, result } = renderHook(
      ({ imageFillPickerFocus }) => useClosePickerWhenFocusMovesAway(true, 'node-1', 0, true, false, imageFillPickerFocus),
      { initialProps: { imageFillPickerFocus: { nodeId: 'node-1', paintIndex: 0 } as { nodeId: string; paintIndex: number } | null } },
    );

    // action
    rerender({ imageFillPickerFocus: { nodeId: 'node-1', paintIndex: 1 } });

    // result
    expect(result.current).toBeUndefined();
  });

  it('should not signal a close for a non-image fill', () => {
    // before
    const { result } = renderHook(() =>
      useClosePickerWhenFocusMovesAway(false, 'node-1', 0, true, true, { nodeId: 'node-1', paintIndex: 1 }),
    );

    // result
    expect(result.current).toBeUndefined();
  });

  it('should not signal a close when there is no focus recorded yet', () => {
    // before
    const { result } = renderHook(() => useClosePickerWhenFocusMovesAway(true, 'node-1', 0, true, true, null));

    // result
    expect(result.current).toBeUndefined();
  });

  it('should signal a close once this fill actually held focus and it then moves to a different fill on the same node', () => {
    // before — first render establishes that this fill genuinely holds focus
    const { rerender, result } = renderHook(
      ({ imageFillPickerFocus }) => useClosePickerWhenFocusMovesAway(true, 'node-1', 0, true, true, imageFillPickerFocus),
      { initialProps: { imageFillPickerFocus: { nodeId: 'node-1', paintIndex: 0 } } },
    );

    expect(result.current).toBeUndefined();

    // action — focus moves to a sibling fill while this one is still open/active
    rerender({ imageFillPickerFocus: { nodeId: 'node-1', paintIndex: 1 } });

    // result
    expect(result.current).toBe(1);
  });

  it('should signal a close when focus moves to a different node entirely, after having held focus', () => {
    // before
    const { rerender, result } = renderHook(
      ({ imageFillPickerFocus }) => useClosePickerWhenFocusMovesAway(true, 'node-1', 0, true, true, imageFillPickerFocus),
      { initialProps: { imageFillPickerFocus: { nodeId: 'node-1', paintIndex: 0 } } },
    );

    // action
    rerender({ imageFillPickerFocus: { nodeId: 'node-2', paintIndex: 0 } });

    // result
    expect(result.current).toBe(1);
  });
});
