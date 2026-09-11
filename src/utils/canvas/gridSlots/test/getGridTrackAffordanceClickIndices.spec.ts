// utils
import { getGridTrackAffordanceClickIndices } from '../getGridTrackAffordanceClickIndices';

describe('getGridTrackAffordanceClickIndices', () => {
  it('should replace the selection with just the clicked index on a plain click', () => {
    expect(getGridTrackAffordanceClickIndices([1, 2], 4, { meta: false, shift: false })).toEqual([4]);
  });

  it('should add the clicked index to the selection with a Cmd/Ctrl click', () => {
    expect(getGridTrackAffordanceClickIndices([1, 2], 4, { meta: true, shift: false })).toEqual([1, 2, 4]);
  });

  it('should remove the clicked index from the selection with a Cmd/Ctrl click on an already-selected index', () => {
    expect(getGridTrackAffordanceClickIndices([1, 2, 4], 2, { meta: true, shift: false })).toEqual([1, 4]);
  });

  it('should select the inclusive range from the last selected index to the clicked one with a Shift click', () => {
    expect(getGridTrackAffordanceClickIndices([1], 4, { meta: false, shift: true })).toEqual([1, 2, 3, 4]);
  });

  it('should select the inclusive range in reverse when the clicked index comes before the anchor', () => {
    expect(getGridTrackAffordanceClickIndices([4], 1, { meta: false, shift: true })).toEqual([1, 2, 3, 4]);
  });

  it('should fall back to a plain single selection on a Shift click when there is no prior selection to anchor from', () => {
    expect(getGridTrackAffordanceClickIndices([], 4, { meta: false, shift: true })).toEqual([4]);
  });
});
