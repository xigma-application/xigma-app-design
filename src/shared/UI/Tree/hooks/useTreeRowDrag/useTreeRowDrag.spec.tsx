import { act, renderHook } from '@testing-library/react';
import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

// hooks
import { useTreeRowDrag } from './useTreeRowDrag';

// others
import { TREE_ROW_DRAG_THRESHOLD_PX } from './constants';

const ROW_HEIGHT = 32;

const createRowsRef = (scrollTop = 0): RefObject<HTMLDivElement | null> => {
  const element = document.createElement('div');

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
  Object.defineProperty(element, 'scrollTop', { configurable: true, value: scrollTop });

  return { current: element };
};

const mouseDownEvent = (clientY: number): ReactMouseEvent<HTMLElement> => ({ button: 0, clientY }) as ReactMouseEvent<HTMLElement>;

const fireMouseMove = (clientY: number): void => {
  act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY })));
};

const fireMouseUp = (): void => {
  act(() => document.dispatchEvent(new MouseEvent('mouseup')));
};

describe('useTreeRowDrag', () => {
  it('should not start dragging while the pointer stays within the threshold', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ count: 3, rowHeight: ROW_HEIGHT, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(TREE_ROW_DRAG_THRESHOLD_PX - 1);

    // result
    expect(result.current.insertionIndex).toBeNull();
  });

  it('should report an insertion index once the pointer moves past the threshold', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ count: 3, rowHeight: ROW_HEIGHT, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(1, mouseDownEvent(0)));
    fireMouseMove(TREE_ROW_DRAG_THRESHOLD_PX);

    // result
    expect(result.current.insertionIndex).not.toBeNull();
  });

  it('should not arm a drag on a non-primary mouse button', () => {
    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ count: 3, rowHeight: ROW_HEIGHT, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, { button: 2, clientY: 0 } as ReactMouseEvent<HTMLElement>));
    fireMouseMove(100);

    // result
    expect(result.current.insertionIndex).toBeNull();
  });

  it('should call onReorder with the mapped index once dropped in a new slot', () => {
    // mock
    const onReorder = vi.fn();

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ count: 4, onReorder, rowHeight: ROW_HEIGHT, rowsRef }));

    // action — drag row 0 down past row 2 (pointer lands in the 3rd row's slot)
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT * 2 + ROW_HEIGHT / 2);
    fireMouseUp();

    // result
    expect(onReorder).toHaveBeenCalledWith(0, 2);
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(result.current.insertionIndex).toBeNull();
  });

  it('should not call onReorder when dropped back in the original slot', () => {
    // mock
    const onReorder = vi.fn();

    // before
    const rowsRef = createRowsRef();
    const { result } = renderHook(() => useTreeRowDrag({ count: 4, onReorder, rowHeight: ROW_HEIGHT, rowsRef }));

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

    // before
    const rowsRef = createRowsRef(ROW_HEIGHT * 2);
    const { result } = renderHook(() => useTreeRowDrag({ count: 6, onReorder, rowHeight: ROW_HEIGHT, rowsRef }));

    // action
    act(() => result.current.handleRowMouseDown(0, mouseDownEvent(0)));
    fireMouseMove(ROW_HEIGHT / 2);
    fireMouseUp();

    // result — scrolled down by 2 rows, so the pointer near the top now targets slot 2
    expect(onReorder).toHaveBeenCalledWith(0, 2);
    expect(onReorder).toHaveBeenCalledTimes(1);
  });

  it('should no-op on mouseup when no drag was armed', () => {
    // mock
    const onReorder = vi.fn();

    // before
    const rowsRef = createRowsRef();
    renderHook(() => useTreeRowDrag({ count: 3, onReorder, rowHeight: ROW_HEIGHT, rowsRef }));

    // action
    fireMouseUp();

    // result
    expect(onReorder).not.toHaveBeenCalled();
  });
});
