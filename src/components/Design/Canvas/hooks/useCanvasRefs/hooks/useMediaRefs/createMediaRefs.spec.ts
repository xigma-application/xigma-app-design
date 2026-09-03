// hooks
import { createMediaRefs } from './createMediaRefs';

describe('createMediaRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createMediaRefs();

    // result
    expect(refs).toEqual({
      armedRef: { current: null },
      queueRef: { current: [] },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const queueRef = { current: [new File([], 'photo.png')] };

    // before
    const refs = createMediaRefs({ queueRef });

    // result
    expect(refs.queueRef).toBe(queueRef);
  });
});
