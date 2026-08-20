// utils
import { resolveVectorMarqueeMode } from '../resolveVectorMarqueeMode';

describe('resolveVectorMarqueeMode', () => {
  it('should return null when nothing has been caught yet', () => {
    // action
    const result = resolveVectorMarqueeMode(null, [], [], []);

    // result
    expect(result).toBeNull();
  });

  it('should lock to "points" the first time a vertex is caught', () => {
    // action
    const result = resolveVectorMarqueeMode(null, ['v1'], [], []);

    // result
    expect(result).toBe('points');
  });

  it('should lock to "everything" the first time a handle is caught with no vertex caught', () => {
    // action
    const result = resolveVectorMarqueeMode(null, [], [{ end: 'start', segmentId: 's1' }], []);

    // result
    expect(result).toBe('everything');
  });

  it('should lock to "everything" the first time a segment is caught with no vertex caught', () => {
    // action
    const result = resolveVectorMarqueeMode(null, [], [], ['s1']);

    // result
    expect(result).toBe('everything');
  });

  it('should keep returning "points" once already locked, even if the current frame would also catch a handle', () => {
    // action
    const result = resolveVectorMarqueeMode('points', ['v1'], [{ end: 'start', segmentId: 's1' }], []);

    // result
    expect(result).toBe('points');
  });

  it('should keep returning "everything" once already locked, even on a frame that catches nothing at all', () => {
    // action
    const result = resolveVectorMarqueeMode('everything', [], [], []);

    // result
    expect(result).toBe('everything');
  });
});
