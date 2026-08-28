// hooks
import { createCornerRadiusRefs } from './createCornerRadiusRefs';

describe('createCornerRadiusRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createCornerRadiusRefs();

    // result
    expect(refs).toEqual({
      cornerRadiusDragRef: { current: null },
      polygonCornerRadiusDragRef: { current: null },
      starCornerRadiusDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const cornerRadiusDragRef = { current: null };

    // before
    const refs = createCornerRadiusRefs({ cornerRadiusDragRef });

    // result
    expect(refs.cornerRadiusDragRef).toBe(cornerRadiusDragRef);
    expect(refs.polygonCornerRadiusDragRef).toEqual({ current: null });
  });
});
