// hooks
import { createSliceRefs } from './createSliceRefs';

describe('createSliceRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createSliceRefs();

    // result
    expect(refs).toEqual({
      sliceRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const sliceRef = { current: { height: 10, rotation: 0, width: 10, x: 0, y: 0 } };

    // before
    const refs = createSliceRefs({ sliceRef });

    // result
    expect(refs.sliceRef).toBe(sliceRef);
  });
});
