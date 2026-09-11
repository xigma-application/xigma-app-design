// types
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { isGridTrackAffordanceDrawSuppressed } from '../isGridTrackAffordanceDrawSuppressed';

const dragState = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 1,
  frameId: 'frame-1',
  ghostPosition: { x: 0, y: 0 },
  hasMoved: true,
  sourceIndices: [1],
  ...overrides,
});

describe('isGridTrackAffordanceDrawSuppressed', () => {
  it('should return false when there is no active drag', () => {
    expect(isGridTrackAffordanceDrawSuppressed('column', 1, null)).toBe(false);
  });

  it('should return false before the pointer has actually moved', () => {
    expect(isGridTrackAffordanceDrawSuppressed('column', 1, dragState({ hasMoved: false }))).toBe(false);
  });

  it('should return false for a different axis', () => {
    expect(isGridTrackAffordanceDrawSuppressed('row', 1, dragState())).toBe(false);
  });

  it('should return false for an index not part of the dragged block', () => {
    expect(isGridTrackAffordanceDrawSuppressed('column', 5, dragState())).toBe(false);
  });

  it('should return true for an index that is part of the dragged block, on its own axis, once moved', () => {
    expect(isGridTrackAffordanceDrawSuppressed('column', 1, dragState())).toBe(true);
  });
});
