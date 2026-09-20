// hooks
import { createBlendModeRefs } from './createBlendModeRefs';

// types
import { BlendMode } from 'types/design/enums';

describe('createBlendModeRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createBlendModeRefs();

    // result
    expect(refs).toEqual({ effectPreviewRef: { current: null }, previewRef: { current: null } });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const previewRef = { current: { blendMode: BlendMode.multiply, nodeId: 'node-1' } };

    // before
    const refs = createBlendModeRefs({ previewRef });

    // result
    expect(refs.previewRef).toBe(previewRef);
  });
});
