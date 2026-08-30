// hooks
import { createFrameNameRefs } from './createFrameNameRefs';

describe('createFrameNameRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createFrameNameRefs();

    // result
    expect(refs).toEqual({ editingLabelRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const editingLabelRef = { current: 'node-1' };

    // before
    const refs = createFrameNameRefs({ editingLabelRef });

    // result
    expect(refs.editingLabelRef).toBe(editingLabelRef);
  });
});
