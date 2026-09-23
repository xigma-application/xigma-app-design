// utils
import { getGridMoveStep } from '../getGridMoveStep';

describe('getGridMoveStep', () => {
  it('should resolve a positive deltaX to a rightward column step', () => {
    expect(getGridMoveStep(1, 0)).toEqual({ axis: 'column', step: 1 });
  });

  it('should resolve a negative deltaX to a leftward column step', () => {
    expect(getGridMoveStep(-1, 0)).toEqual({ axis: 'column', step: -1 });
  });

  it('should resolve a positive deltaY to a downward row step', () => {
    expect(getGridMoveStep(0, 1)).toEqual({ axis: 'row', step: 1 });
  });

  it('should resolve a negative deltaY to an upward row step', () => {
    expect(getGridMoveStep(0, -1)).toEqual({ axis: 'row', step: -1 });
  });

  it('should prefer the column axis when both deltas are somehow non-zero', () => {
    expect(getGridMoveStep(1, 1)).toEqual({ axis: 'column', step: 1 });
  });

  it('should return null when neither delta is set', () => {
    expect(getGridMoveStep(0, 0)).toBeNull();
  });
});
