// utils
import { cacheSegments, crossSegments, crossVertices } from './crossingFixtures';
import { detectMovedSegmentIds } from '../detectMovedSegmentIds';

describe('detectMovedSegmentIds', () => {
  it('should list the segments whose flattened entry changed', () => {
    // mock
    const last = cacheSegments(crossSegments, crossVertices);
    const current = new Map(last);
    current.set('v', { ...last.get('v')! });

    // result
    expect(detectMovedSegmentIds(crossSegments, current, last, 2)).toEqual(['v']);
    expect(detectMovedSegmentIds(crossSegments, last, last, 2)).toEqual([]);
  });

  it('should give up when too many segments moved', () => {
    // mock
    const last = cacheSegments(crossSegments, crossVertices);

    // result
    expect(detectMovedSegmentIds(crossSegments, new Map(), last, 1)).toBeNull();
  });

  it('should give up when the set of segments changed', () => {
    // mock
    const last = cacheSegments(crossSegments, crossVertices);
    const renamed = new Map([...last].map(([id, entry]) => [id === 'far' ? 'gone' : id, entry]));

    // result
    expect(detectMovedSegmentIds(crossSegments.slice(1), last, last, 5)).toBeNull();
    expect(detectMovedSegmentIds(crossSegments, last, renamed, 5)).toBeNull();
  });
});
