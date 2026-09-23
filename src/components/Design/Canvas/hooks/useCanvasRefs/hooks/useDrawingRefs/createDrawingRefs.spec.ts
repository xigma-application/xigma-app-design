// hooks
import { createDrawingRefs } from './createDrawingRefs';

describe('createDrawingRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createDrawingRefs();

    // result
    expect(refs).toEqual({ cancelDrawRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const cancelDrawRef = { current: (): void => undefined };

    // before
    const refs = createDrawingRefs({ cancelDrawRef });

    // result
    expect(refs.cancelDrawRef).toBe(cancelDrawRef);
  });
});
