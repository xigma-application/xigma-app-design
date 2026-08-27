// types
import { TVectorSegment } from 'types/design/types';

// utils
import { omitSegment } from '../omitSegment';

const segment = (id: string): TVectorSegment => ({ endId: 'b', id, startId: 'a', tangentEnd: null, tangentStart: null });

describe('omitSegment', () => {
  it('should drop the named segment and keep the rest', () => {
    // action
    const result = omitSegment({ s1: segment('s1'), s2: segment('s2') }, 's1');

    // result
    expect(result).toEqual({ s2: segment('s2') });
  });

  it('should return an equal map when the id is absent', () => {
    // action
    const result = omitSegment({ s1: segment('s1') }, 'missing');

    // result
    expect(result).toEqual({ s1: segment('s1') });
  });
});
