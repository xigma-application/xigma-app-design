// utils
import { resolveVectorMarqueeMode } from '../resolveVectorMarqueeMode';

describe('resolveVectorMarqueeMode', () => {
  it('should return null when nothing has been caught yet', () => {
    // action
    const result = resolveVectorMarqueeMode(null, [], [], []);

    // result
    expect(result).toBeNull();
  });

  it('should lock to "points" the first time a vertex is caught, with no handle involved', () => {
    // action
    const result = resolveVectorMarqueeMode(null, ['v1'], [], []);

    // result
    expect(result).toBe('points');
  });

  it('should lock to "handles" the first time a handle is caught, with nothing else caught', () => {
    // action
    const result = resolveVectorMarqueeMode(null, [], [{ end: 'start', segmentId: 's1' }], []);

    // result
    expect(result).toBe('handles');
  });

  it('should lock to "everything" the first time a segment is caught with no vertex or handle caught', () => {
    // action
    const result = resolveVectorMarqueeMode(null, [], [], ['s1']);

    // result
    expect(result).toBe('everything');
  });

  it('should lock to "handles" on the very first frame even when a vertex and a segment are also caught alongside the handle', () => {
    // action — a handle outranks everything else, even simultaneously on the first frame
    const result = resolveVectorMarqueeMode(null, ['v1'], [{ end: 'start', segmentId: 's1' }], ['s1']);

    // result
    expect(result).toBe('handles');
  });

  it('should keep returning "points" once already locked, as long as no handle is caught this frame', () => {
    // action
    const result = resolveVectorMarqueeMode('points', ['v1'], [], []);

    // result
    expect(result).toBe('points');
  });

  it('should promote an already-locked "points" mode to "handles" the moment a handle is caught, even mid-gesture', () => {
    // action — a handle outranks an already-locked points mode
    const result = resolveVectorMarqueeMode('points', [], [{ end: 'start', segmentId: 's1' }], []);

    // result
    expect(result).toBe('handles');
  });

  it('should keep returning "handles" once already locked, even on a frame that catches nothing at all', () => {
    // action
    const result = resolveVectorMarqueeMode('handles', [], [], []);

    // result
    expect(result).toBe('handles');
  });

  it('should keep returning "everything" once already locked, even on a frame that catches nothing at all', () => {
    // action
    const result = resolveVectorMarqueeMode('everything', [], [], []);

    // result
    expect(result).toBe('everything');
  });

  it('should resolve straight to "points" when a vertex and a segment are caught together on the very first frame', () => {
    // action — the point takes over from the segment, even with nothing locked yet beforehand
    const result = resolveVectorMarqueeMode(null, ['v1'], [], ['s1']);

    // result
    expect(result).toBe('points');
  });

  it('should resolve to "points" when a vertex and two-or-more segments are caught together on the very first frame', () => {
    // action — segments are always dropped for a point, regardless of how many are caught
    const result = resolveVectorMarqueeMode(null, ['v1'], [], ['s1', 's2']);

    // result
    expect(result).toBe('points');
  });

  it('should swap down to "points" mid-gesture the moment a point arrives, dropping every segment already selected', () => {
    // action — already unlocked to "everything" with segments selected, but a point now joins in
    const result = resolveVectorMarqueeMode('everything', ['v1'], [], ['s1', 's2']);

    // result
    expect(result).toBe('points');
  });
});
