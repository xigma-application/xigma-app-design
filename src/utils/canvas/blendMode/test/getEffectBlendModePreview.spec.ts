// types
import { BlendMode } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getEffectBlendModePreview } from '../getEffectBlendModePreview';

describe('getEffectBlendModePreview', () => {
  it('should return the previewed blend mode for the matching node and effect index', () => {
    // mock
    const refs = createCanvasRefs({
      blendMode: {
        effectPreviewRef: { current: { blendMode: BlendMode.screen, effectIndex: 1, nodeIds: ['node-1'] } },
        previewRef: { current: null },
      },
    });

    // result
    expect(getEffectBlendModePreview(refs, 'node-1', 1)).toBe(BlendMode.screen);
  });

  it('should return undefined for another node, another effect, or without a preview', () => {
    // mock
    const refs = createCanvasRefs({
      blendMode: {
        effectPreviewRef: { current: { blendMode: BlendMode.screen, effectIndex: 1, nodeIds: ['node-1'] } },
        previewRef: { current: null },
      },
    });

    // result
    expect(getEffectBlendModePreview(refs, 'node-2', 1)).toBeUndefined();
    expect(getEffectBlendModePreview(refs, 'node-1', 0)).toBeUndefined();
    expect(getEffectBlendModePreview(createCanvasRefs(), 'node-1', 1)).toBeUndefined();
  });
});
