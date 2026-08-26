// types
import { TVectorSegment } from 'types/design/types';

// utils
import { isVectorHandleVisible } from '../isVectorHandleVisible';

const segment: TVectorSegment = { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null };

describe('isVectorHandleVisible', () => {
  it('should be visible when the segment’s start vertex is directly selected', () => {
    // before
    const result = isVectorHandleVisible(segment, 'start', new Set(['v1']), new Set(), new Set(), []);

    // result
    expect(result).toBe(true);
  });

  it('should be visible when the segment’s end vertex is directly selected', () => {
    // before
    const result = isVectorHandleVisible(segment, 'end', new Set(['v2']), new Set(), new Set(), []);

    // result
    expect(result).toBe(true);
  });

  it('should be visible when the segment itself is selected, even with neither vertex selected', () => {
    // before
    const result = isVectorHandleVisible(segment, 'start', new Set(), new Set(), new Set(['s1']), []);

    // result
    expect(result).toBe(true);
  });

  it('should be visible when the queried end’s vertex is one hop away from the selection', () => {
    // before
    const result = isVectorHandleVisible(segment, 'end', new Set(), new Set(['v2']), new Set(), []);

    // result
    expect(result).toBe(true);
  });

  it('should not be visible when the other end’s vertex is one hop away, but the queried end is not', () => {
    // before
    const result = isVectorHandleVisible(segment, 'start', new Set(), new Set(['v2']), new Set(), []);

    // result
    expect(result).toBe(false);
  });

  it('should be visible when the handle itself is in the selected handles list, matching both segment id and end', () => {
    // before
    const result = isVectorHandleVisible(segment, 'start', new Set(), new Set(), new Set(), [{ end: 'start', segmentId: 's1' }]);

    // result
    expect(result).toBe(true);
  });

  it('should not be visible when a selected handle matches the segment id but not the queried end', () => {
    // before
    const result = isVectorHandleVisible(segment, 'start', new Set(), new Set(), new Set(), [{ end: 'end', segmentId: 's1' }]);

    // result
    expect(result).toBe(false);
  });

  it('should not be visible when nothing about the segment, its vertices, or its handles is selected or nearby', () => {
    // before
    const result = isVectorHandleVisible(segment, 'start', new Set(), new Set(), new Set(), []);

    // result
    expect(result).toBe(false);
  });
});
