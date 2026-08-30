// hooks
import { createSectionNameRefs } from './createSectionNameRefs';

describe('createSectionNameRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createSectionNameRefs();

    // result
    expect(refs).toEqual({ editingLabelRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const editingLabelRef = { current: 'section-1' };

    // before
    const refs = createSectionNameRefs({ editingLabelRef });

    // result
    expect(refs.editingLabelRef).toBe(editingLabelRef);
  });
});
