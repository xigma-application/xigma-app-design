import { act, renderHook } from '@testing-library/react';
import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

// hooks
import { useTreeRowDrag } from './useTreeRowDrag';

// others
import { TREE_ROW_DRAG_THRESHOLD_PX, TREE_SPRING_LOAD_DELAY_MS } from './constants';

// types
import { TTreeItem, TTreeRow } from '../../types';

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

const flatRows = (count: number): TTreeRow<TItem>[] => Array.from({ length: count }, (_, index) => buildRow(String(index)));

const createRowsRef = (scrollTop = 0, left = 0): RefObject<HTMLDivElement | null> => {
  const element = document.createElement('div');

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left, top: 0 } as DOMRect);
  Object.defineProperty(element, 'scrollTop', { configurable: true, value: scrollTop });

  return { current: element };
};

const mouseDownEvent = (clientY: number): ReactMouseEvent<HTMLElement> => ({ button: 0, clientY }) as ReactMouseEvent<HTMLElement>;

const fireMouseMove = (clientY: number, clientX = 0): void => {
  act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY })));
};

const fireMouseUp = (): void => {
  act(() => document.dispatchEvent(new MouseEvent('mouseup')));
};

describe('useTreeRowDrag', () => {
  it('should not start dragging while the pointer stays within the threshold', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ rowHeight: ROW_HEIGHT, rows: flatRows(3), rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(TREE_ROW_DRAG_THRESHOLD_PX - 1);

    // result
    expect(result.current.insertionIndex).toBeNull();
  });

  it('should report an insertion index once the pointer moves past the threshold', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ rowHeight: ROW_HEIGHT, rows: flatRows(3), rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(1, mouseDownEvent(0)));
    fireMouseMove(TREE_ROW_DRAG_THRESHOLD_PX);

    // result
    expect(result.current.insertionIndex).not.toBeNull();
  });

  it('should not arm a drag on a non-primary mouse button', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ rowHeight: ROW_HEIGHT, rows: flatRows(3), rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, { button: 2, clientY: 0 } as ReactMouseEvent<HTMLElement>));
    fireMouseMove(100);

    // result
    expect(result.current.insertionIndex).toBeNull();
  });

  it('should call onReorder with the resolved target once dropped in a new slot', () => {
    // mock
    const onReorder = vi.fn();
    const rows = flatRows(4);

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action — drag row 0 down past row 2 (pointer lands in the 3rd row's slot)
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT * 2 + ROW_HEIGHT / 2);
    fireMouseUp();

    // result
    expect(onReorder).toHaveBeenCalledWith([rows[0].item], null, 2);
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(result.current.insertionIndex).toBeNull();
  });

  it('should not call onReorder when dropped back in the original slot', () => {
    // mock
    const onReorder = vi.fn();

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows: flatRows(4), rowsRef }));

    // action — pointer moves past the threshold but settles back over row 1's own slot
    act(() => result.current.handleRowMouseDown(1, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT);
    fireMouseUp();

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should account for the container scroll offset when computing the drop slot', () => {
    // mock
    const onReorder = vi.fn();
    const rows = flatRows(6);

    // before
    const rowsRef = createRowsRef(ROW_HEIGHT * 2);
    const { result } = renderHook(() => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT / 2);
    fireMouseUp();

    // result — scrolled down by 2 rows, so the pointer near the top now targets slot 2
    expect(onReorder).toHaveBeenCalledWith([rows[0].item], null, 2);
    expect(onReorder).toHaveBeenCalledTimes(1);
  });

  it('should no-op on mouseup when no drag was armed', () => {
    // mock
    const onReorder = vi.fn();

    // before
    const rowsRef = createRowsRef();
    renderHook(() => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows: flatRows(3), rowsRef }));

    // action
    fireMouseUp();

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should drag the whole multi-selection together when starting the drag on a selected row', () => {
    // mock
    const onReorder = vi.fn();
    const rows = flatRows(4);
    const isRowSelected = (item: TItem): boolean => item.id === '0' || item.id === '1';

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ isRowSelected, onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action — drag row 0 (part of the [0,1] selection) down past row 3
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT * 4);
    fireMouseUp();

    // result — both selected rows move together
    expect(onReorder).toHaveBeenCalledWith([rows[0].item, rows[1].item], null, 2);
  });

  it('should only drag the clicked row when it is not part of the current multi-selection', () => {
    // mock
    const onReorder = vi.fn();
    const rows = flatRows(4);
    const isRowSelected = (item: TItem): boolean => item.id === '0' || item.id === '1';

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ isRowSelected, onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action — drag row 3, which is not selected
    act(() => result.current.handleRowMouseDown(3, mouseDownEvent(0)));
    fireMouseMove(TREE_ROW_DRAG_THRESHOLD_PX);
    fireMouseUp();

    // result — only row 3 moves
    expect(onReorder).toHaveBeenCalledWith([rows[3].item], null, 0);
  });

  it('should keep dropDepth at 0 for a flat tree, regardless of pointer X', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ rowHeight: ROW_HEIGHT, rows: flatRows(3), rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT, 1000);

    // result
    expect(result.current.dropDepth).toBe(0);
  });

  it('should compute dropDepth from the pointer X offset, clamped to the depth range around the insertion gap', () => {
    // mock — a gap between a depth-0 row and a depth-2 row allows depths 0..2
    const rows = [buildRow('0', 0), buildRow('0-0', 1, { id: '0' }), buildRow('0-0-0', 2, { id: '0-0' }), buildRow('1', 0)];

    // before
    const rowsRef = createRowsRef(0, 0);
    const { result } = renderHook(() => useTreeRowDrag({ rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action — pointer sits two full indent-widths to the right, at the gap right before the last row (index 3)
    act(() => result.current.handleRowMouseDown(3, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT * 3, 32);

    // result
    expect(result.current.dropDepth).toBe(2);
  });

  it('should nest the dragged row into a collapsed container dropped onto its middle', () => {
    // mock
    const onReorder = vi.fn();
    const rows = [buildRow('a'), buildRow('g', 0, null, { canHaveChildren: true })];

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action — drag row 0 onto the middle of the collapsed group row
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT + ROW_HEIGHT / 2);

    // result — the row reports drop-inside mode
    expect(result.current.dropInsideIndex).toBe(1);

    fireMouseUp();
    expect(onReorder).toHaveBeenCalledWith([rows[0].item], rows[1].item, 0);
  });

  it('should auto-expand a collapsed container after hovering it for the spring-load delay', () => {
    // mock
    vi.useFakeTimers();
    const onSpringLoadExpand = vi.fn();
    const rows = [buildRow('a'), buildRow('g', 0, null, { canHaveChildren: true })];

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ onSpringLoadExpand, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT + ROW_HEIGHT / 2);
    act(() => vi.advanceTimersByTime(TREE_SPRING_LOAD_DELAY_MS));

    // result
    expect(onSpringLoadExpand).toHaveBeenCalledWith('g');

    vi.useRealTimers();
  });

  it('should still drop into a container that spring-load just expanded, even without any further pointer move', () => {
    // mock — root is [group, dragged rect]; expanding the group pushes the rect from index 1 to index 2
    const onReorder = vi.fn();
    const collapsed = [buildRow('g', 0, null, { canHaveChildren: true, hasChildren: true }), buildRow('c')];
    const expanded = [
      buildRow('g', 0, null, { canHaveChildren: true, hasChildren: true, isExpanded: true }),
      buildRow('g-0', 1, { id: 'g' }),
      buildRow('c'),
    ];

    // before
    const rowsRef = createRowsRef();
    const { result, rerender } = renderHook(({ rows }) => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }), {
      initialProps: { rows: collapsed },
    });

    // action — drag "c" onto the middle of the collapsed group row, then the group expands under a motionless pointer
    act(() => result.current.handleRowMouseDown(1, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT / 2);
    expect(result.current.dropInsideIndex).toBe(0);
    rerender({ rows: expanded });
    fireMouseUp();

    // result — "c" lands inside the group, not the child row that slid under the pointer
    expect(onReorder).toHaveBeenCalledWith([expanded[2].item], expanded[0].item, 0);
  });

  it('should not treat a same-slot drop as a no-op once the drop depth changed', () => {
    // mock — a nested child dropped roughly back onto its own slot, but shifted left out to depth 0
    const onReorder = vi.fn();
    const rows = [buildRow('0', 0), buildRow('0-0', 1, { id: '0' }), buildRow('1', 0)];

    // before
    const rowsRef = createRowsRef(0, 0);
    const { result } = renderHook(() => useTreeRowDrag({ onReorder, rowHeight: ROW_HEIGHT, rows, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(1, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT, 0);
    fireMouseUp();

    // result — depth changed from 1 to 0, so this is a real move, not a no-op
    expect(onReorder).toHaveBeenCalledTimes(1);
  });
});
