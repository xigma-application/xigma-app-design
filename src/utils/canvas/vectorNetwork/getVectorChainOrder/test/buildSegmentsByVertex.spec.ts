// types
import { TVectorSegment } from 'types/design/types';

// utils
import { buildSegmentsByVertex } from '../buildSegmentsByVertex';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

describe('buildSegmentsByVertex', () => {
  it('should index each segment under both its start and end vertex', () => {
    // mock
    const s1 = seg('s1', 'a', 'b');

    // before
    const result = buildSegmentsByVertex([s1]);

    // result
    expect(result.get('a')).toEqual([s1]);
    expect(result.get('b')).toEqual([s1]);
  });

  it('should list multiple segments touching the same vertex in insertion order', () => {
    // mock — both s1 and s2 touch 'b'
    const s1 = seg('s1', 'a', 'b');
    const s2 = seg('s2', 'b', 'c');

    // before
    const result = buildSegmentsByVertex([s1, s2]);

    // result
    expect(result.get('b')).toEqual([s1, s2]);
  });

  it('should list a self-closing segment twice under its single vertex — once for its start end, once for its end end', () => {
    // mock — a segment whose start and end are the same vertex
    const s1 = seg('s1', 'a', 'a');

    // before
    const result = buildSegmentsByVertex([s1]);

    // result
    expect(result.get('a')).toEqual([s1, s1]);
  });
});
