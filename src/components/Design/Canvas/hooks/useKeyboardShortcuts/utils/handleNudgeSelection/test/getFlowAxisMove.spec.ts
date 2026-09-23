// types
import { LayoutMode } from 'types/design/enums';

// utils
import { getFlowAxisMove } from '../getFlowAxisMove';

describe('getFlowAxisMove', () => {
  it('should treat rightward delta as a forward primary move for a horizontal frame', () => {
    expect(getFlowAxisMove(LayoutMode.horizontal, 1, 0)).toEqual({ direction: 1, kind: 'primary' });
  });

  it('should treat leftward delta as a backward primary move for a horizontal frame', () => {
    expect(getFlowAxisMove(LayoutMode.horizontal, -1, 0)).toEqual({ direction: -1, kind: 'primary' });
  });

  it('should treat downward delta as a forward cross move for a horizontal frame', () => {
    expect(getFlowAxisMove(LayoutMode.horizontal, 0, 1)).toEqual({ direction: 1, kind: 'cross' });
  });

  it('should treat upward delta as a backward cross move for a horizontal frame', () => {
    expect(getFlowAxisMove(LayoutMode.horizontal, 0, -1)).toEqual({ direction: -1, kind: 'cross' });
  });

  it('should treat downward delta as a forward primary move for a vertical frame', () => {
    expect(getFlowAxisMove(LayoutMode.vertical, 0, 1)).toEqual({ direction: 1, kind: 'primary' });
  });

  it('should treat upward delta as a backward primary move for a vertical frame', () => {
    expect(getFlowAxisMove(LayoutMode.vertical, 0, -1)).toEqual({ direction: -1, kind: 'primary' });
  });

  it('should treat rightward delta as a forward cross move for a vertical frame', () => {
    expect(getFlowAxisMove(LayoutMode.vertical, 1, 0)).toEqual({ direction: 1, kind: 'cross' });
  });

  it('should treat leftward delta as a backward cross move for a vertical frame', () => {
    expect(getFlowAxisMove(LayoutMode.vertical, -1, 0)).toEqual({ direction: -1, kind: 'cross' });
  });

  it('should return null when neither delta is set', () => {
    expect(getFlowAxisMove(LayoutMode.horizontal, 0, 0)).toBeNull();
  });
});
