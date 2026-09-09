import { act, renderHook } from '@testing-library/react';
import { MouseEvent } from 'react';

// hooks
import { useCellsInput } from '../useCellsInput';

const cellEvent = (dataValue: string | null): MouseEvent => ({ target: { getAttribute: () => dataValue } }) as unknown as MouseEvent;

describe('useCellsInput', () => {
  it('should start with an empty active cell', () => {
    const { result } = renderHook(() => useCellsInput(vi.fn(), vi.fn()));

    expect(result.current.activeCell).toEqual({ columns: 0, rows: 0 });
  });

  it('should track the hovered cell from its data-value', () => {
    const { result } = renderHook(() => useCellsInput(vi.fn(), vi.fn()));

    act(() => result.current.onMouseMove(cellEvent('3.2')));

    expect(result.current.activeCell).toEqual({ columns: 3, rows: 2 });
  });

  it('should ignore a hover over an element without a data-value', () => {
    const { result } = renderHook(() => useCellsInput(vi.fn(), vi.fn()));

    act(() => result.current.onMouseMove(cellEvent('3.2')));
    act(() => result.current.onMouseMove(cellEvent(null)));

    expect(result.current.activeCell).toEqual({ columns: 3, rows: 2 });
  });

  it('should reset the active cell on mouse leave', () => {
    const { result } = renderHook(() => useCellsInput(vi.fn(), vi.fn()));

    act(() => result.current.onMouseMove(cellEvent('3.2')));
    act(() => result.current.onMouseLeave());

    expect(result.current.activeCell).toEqual({ columns: 0, rows: 0 });
  });

  it('should commit the clicked cell and close the popover', () => {
    const onClickCell = vi.fn();
    const close = vi.fn();
    const { result } = renderHook(() => useCellsInput(onClickCell, close));

    act(() => result.current.onClick(cellEvent('5.4')));

    expect(onClickCell).toHaveBeenCalledWith({ columns: 5, rows: 4 });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when clicking outside a cell', () => {
    const onClickCell = vi.fn();
    const close = vi.fn();
    const { result } = renderHook(() => useCellsInput(onClickCell, close));

    act(() => result.current.onClick(cellEvent(null)));

    expect(onClickCell).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
