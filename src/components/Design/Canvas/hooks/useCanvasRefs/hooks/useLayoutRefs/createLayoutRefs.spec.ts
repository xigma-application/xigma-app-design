// hooks
import { createLayoutRefs } from './createLayoutRefs';

describe('createLayoutRefs behaviors', () => {
  it('should default every ref to 0', () => {
    // before
    const refs = createLayoutRefs();

    // result
    expect(refs).toEqual({
      leftPanelWidthRef: { current: 0 },
      rightPanelWidthRef: { current: 0 },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const leftPanelWidthRef = { current: 400 };

    // before
    const refs = createLayoutRefs({ leftPanelWidthRef });

    // result
    expect(refs.leftPanelWidthRef).toBe(leftPanelWidthRef);
    expect(refs.rightPanelWidthRef).toEqual({ current: 0 });
  });
});
