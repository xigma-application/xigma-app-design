import { RefObject } from 'react';

// others
import { TREE_SPRING_LOAD_DELAY_MS } from '../../../constants';

// types
import { TTreeDragState } from '../../../types';
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { handleMouseMove } from '../handleMouseMove';

const ROW_HEIGHT = 32;

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0, parentItem: TItem | null = null, overrides: Partial<TTreeRow<TItem>> = {}): TTreeRow<TItem> => ({
  canHaveChildren: false,
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem,
  ...overrides,
});

const buildDragState = (overrides: Partial<TTreeDragState> = {}): TTreeDragState => ({
  armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } },
  dropDepth: 0,
  dropInsideIndex: null,
  insertionIndex: null,
  onSpringLoadExpandRef: { current: undefined },
  setDropDepth: vi.fn(),
  setDropInsideIndex: vi.fn(),
  setInsertionIndex: vi.fn(),
  springLoadRef: { current: null },
  ...overrides,
});

const createRowsRef = (left = 0, scrollTop = 0): RefObject<HTMLDivElement | null> => {
  const element = document.createElement('div');

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left, top: 0 } as DOMRect);
  Object.defineProperty(element, 'scrollTop', { configurable: true, value: scrollTop });

  return { current: element };
};

const mouseMoveEvent = (clientY: number, clientX = 0): MouseEvent => new MouseEvent('mousemove', { clientX, clientY });

describe('handleMouseMove', () => {
  it('should do nothing when no drag is armed', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: null } });

    // action
    handleMouseMove(mouseMoveEvent(100), [buildRow('a')], ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).not.toHaveBeenCalled();
  });

  it('should not update the insertion index while the pointer stays within the drag threshold', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } } });

    // action
    handleMouseMove(mouseMoveEvent(1), [buildRow('a'), buildRow('b')], ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).not.toHaveBeenCalled();
  });

  it('should update the insertion index and drop depth once the pointer moves past the threshold', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } } });
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];

    // action
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT * 2), rows, ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(2);
    expect(dragState.setDropDepth).toHaveBeenCalledWith(0);
  });

  it('should keep tracking once a drag is already in progress, even within the threshold distance', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } }, insertionIndex: 1 });

    // action
    handleMouseMove(mouseMoveEvent(1), [buildRow('a'), buildRow('b')], ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).toHaveBeenCalled();
  });

  it('should account for the container scroll offset when computing the insertion index', () => {
    // mock — startY far from the move position so the threshold check is trivially passed
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: -1000 } } });
    const rows = [buildRow('a'), buildRow('b'), buildRow('c'), buildRow('d')];

    // action
    handleMouseMove(mouseMoveEvent(0), rows, ROW_HEIGHT, createRowsRef(0, ROW_HEIGHT * 2), dragState);

    // result — scrolled down by 2 rows, so the pointer at the very top now targets slot 2
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(2);
  });

  it('should compute the drop depth from the pointer X offset relative to the container left edge', () => {
    // mock — a nested row so the depth range spans [0, 1]
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: 0 } } });
    const rows = [buildRow('a', 0), buildRow('b', 1, { id: 'a' })];

    // action
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT, 16), rows, ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setDropDepth).toHaveBeenCalledWith(1);
  });

  it('should switch to drop-inside mode over the middle of a collapsed container row', () => {
    // mock — dragging "a" over the middle of the collapsed group "g"
    const dragState = buildDragState({ armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: -1000 } } });
    const rows = [buildRow('a'), buildRow('g', 0, null, { canHaveChildren: true })];

    // action — pointer half-way down row 1
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT + ROW_HEIGHT / 2), rows, ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setDropInsideIndex).toHaveBeenCalledWith(1);
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(2);
    expect(dragState.setDropDepth).toHaveBeenCalledWith(1);
  });

  it('should schedule a spring-load expand while hovering a collapsed container', () => {
    // mock
    vi.useFakeTimers();
    const onSpringLoadExpand = vi.fn();
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: -1000 } },
      onSpringLoadExpandRef: { current: onSpringLoadExpand },
    });
    const rows = [buildRow('a'), buildRow('g', 0, null, { canHaveChildren: true })];

    // action
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT + ROW_HEIGHT / 2), rows, ROW_HEIGHT, createRowsRef(), dragState);
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS);

    // result
    expect(onSpringLoadExpand).toHaveBeenCalledWith('g');
    vi.useRealTimers();
  });

  it('should offer drop-inside over an already-expanded container without scheduling a spring-load', () => {
    // mock
    vi.useFakeTimers();
    const onSpringLoadExpand = vi.fn();
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: -1000 } },
      onSpringLoadExpandRef: { current: onSpringLoadExpand },
    });
    const rows = [buildRow('a'), buildRow('g', 0, null, { canHaveChildren: true, hasChildren: true, isExpanded: true })];

    // action
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT + ROW_HEIGHT / 2), rows, ROW_HEIGHT, createRowsRef(), dragState);
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS);

    // result
    expect(dragState.setDropInsideIndex).toHaveBeenCalledWith(1);
    expect(onSpringLoadExpand).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should cancel a pending spring-load once the pointer leaves the container', () => {
    // mock
    vi.useFakeTimers();
    const onSpringLoadExpand = vi.fn();
    const dragState = buildDragState({
      armedRef: { current: { depth: 0, ids: ['a'], indices: [0], startY: -1000 } },
      onSpringLoadExpandRef: { current: onSpringLoadExpand },
      springLoadRef: { current: null },
    });
    const rows = [buildRow('a'), buildRow('g', 0, null, { canHaveChildren: true }), buildRow('b')];

    // action — first over the container, then back onto a plain row
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT + ROW_HEIGHT / 2), rows, ROW_HEIGHT, createRowsRef(), dragState);
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT * 2 + ROW_HEIGHT / 2), rows, ROW_HEIGHT, createRowsRef(), dragState);
    vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS);

    // result
    expect(onSpringLoadExpand).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
