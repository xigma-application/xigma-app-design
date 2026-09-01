// others
import { TREE_SPRING_LOAD_DELAY_MS } from '../../../constants';

// types
import { TTreeDragState } from '../../../types';

// utils
import { handleSpringLoad } from '../handleSpringLoad';

const buildDragState = (overrides: Partial<TTreeDragState> = {}): TTreeDragState => ({
  armedRef: { current: null },
  dropDepth: 0,
  dropInsideIndex: null,
  insertionIndex: null,
  onSpringLoadExpandRef: { current: vi.fn() },
  setDropDepth: vi.fn(),
  setDropInsideIndex: vi.fn(),
  setInsertionIndex: vi.fn(),
  springLoadRef: { current: null },
  ...overrides,
});

describe('handleSpringLoad', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should expand the hovered container once the delay elapses', () => {
    // mock
    const onExpand = vi.fn();
    const dragState = buildDragState({ onSpringLoadExpandRef: { current: onExpand } });

    // action
    handleSpringLoad(dragState, 'group');
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS);

    // result
    expect(onExpand).toHaveBeenCalledWith('group');
  });

  it('should not fire before the delay elapses', () => {
    // mock
    const onExpand = vi.fn();
    const dragState = buildDragState({ onSpringLoadExpandRef: { current: onExpand } });

    // action
    handleSpringLoad(dragState, 'group');
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS - 1);

    // result
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('should keep the running timer when the same container stays hovered', () => {
    // spy
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const dragState = buildDragState();

    // action
    handleSpringLoad(dragState, 'group');
    handleSpringLoad(dragState, 'group');

    // result
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });

  it('should restart the countdown when the hovered container changes', () => {
    // mock
    const onExpand = vi.fn();
    const dragState = buildDragState({ onSpringLoadExpandRef: { current: onExpand } });

    // action
    handleSpringLoad(dragState, 'group-a');
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS - 500);
    handleSpringLoad(dragState, 'group-b');
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS - 500);

    // result — the first timer was cancelled, only the second is still counting
    expect(onExpand).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(onExpand).toHaveBeenCalledWith('group-b');
    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});
