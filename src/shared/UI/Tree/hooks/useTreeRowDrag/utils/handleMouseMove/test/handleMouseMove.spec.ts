import { RefObject } from 'react';

// types
import { TTreeDragState } from '../../../types';
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { handleMouseMove } from '../handleMouseMove';

const ROW_HEIGHT = 32;

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0, parentItem: TItem | null = null): TTreeRow<TItem> => ({
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem,
});

const buildDragState = (overrides: Partial<TTreeDragState> = {}): TTreeDragState => ({
  armedRef: { current: { depth: 0, indices: [0], startY: 0 } },
  dropDepth: 0,
  insertionIndex: null,
  setDropDepth: vi.fn(),
  setInsertionIndex: vi.fn(),
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
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } } });

    // action
    handleMouseMove(mouseMoveEvent(1), [buildRow('a'), buildRow('b')], ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).not.toHaveBeenCalled();
  });

  it('should update the insertion index and drop depth once the pointer moves past the threshold', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } } });
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];

    // action
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT * 2), rows, ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(2);
    expect(dragState.setDropDepth).toHaveBeenCalledWith(0);
  });

  it('should keep tracking once a drag is already in progress, even within the threshold distance', () => {
    // mock
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } }, insertionIndex: 1 });

    // action
    handleMouseMove(mouseMoveEvent(1), [buildRow('a'), buildRow('b')], ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setInsertionIndex).toHaveBeenCalled();
  });

  it('should account for the container scroll offset when computing the insertion index', () => {
    // mock — startY far from the move position so the threshold check is trivially passed
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: -1000 } } });
    const rows = [buildRow('a'), buildRow('b'), buildRow('c'), buildRow('d')];

    // action
    handleMouseMove(mouseMoveEvent(0), rows, ROW_HEIGHT, createRowsRef(0, ROW_HEIGHT * 2), dragState);

    // result — scrolled down by 2 rows, so the pointer at the very top now targets slot 2
    expect(dragState.setInsertionIndex).toHaveBeenCalledWith(2);
  });

  it('should compute the drop depth from the pointer X offset relative to the container left edge', () => {
    // mock — a nested row so the depth range spans [0, 1]
    const dragState = buildDragState({ armedRef: { current: { depth: 0, indices: [0], startY: 0 } } });
    const rows = [buildRow('a', 0), buildRow('b', 1, { id: 'a' })];

    // action
    handleMouseMove(mouseMoveEvent(ROW_HEIGHT, 16), rows, ROW_HEIGHT, createRowsRef(), dragState);

    // result
    expect(dragState.setDropDepth).toHaveBeenCalledWith(1);
  });
});
