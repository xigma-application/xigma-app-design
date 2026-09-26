// utils
import { replaceVectorSegmentEnd } from '../replaceVectorSegmentEnd';

const segment = { endId: 'b', id: 's', startId: 'a', tangentEnd: null, tangentStart: null };

describe('replaceVectorSegmentEnd', () => {
  it('should swap whichever end sits on the vertex', () => {
    // result
    expect(replaceVectorSegmentEnd(segment, 'a', 'n')).toMatchObject({ endId: 'b', startId: 'n' });
    expect(replaceVectorSegmentEnd(segment, 'b', 'n')).toMatchObject({ endId: 'n', startId: 'a' });
  });
});
