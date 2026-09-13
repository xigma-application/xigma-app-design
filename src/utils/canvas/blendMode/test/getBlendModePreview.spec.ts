// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getBlendModePreview } from '../getBlendModePreview';

// types
import { BlendMode } from 'types/design/enums';

describe('getBlendModePreview', () => {
  it('should return undefined when nothing is being previewed', () => {
    expect(getBlendModePreview(createCanvasRefs(), 'node-1')).toBeUndefined();
  });

  it("should return undefined when a node id isn't provided and no preview is active, without throwing", () => {
    expect(getBlendModePreview(createCanvasRefs(), undefined as unknown as string)).toBeUndefined();
  });

  it('should return the previewed blend mode for the matching node', () => {
    const refs = createCanvasRefs({ blendMode: { previewRef: { current: { blendMode: BlendMode.screen, nodeId: 'node-1' } } } });

    expect(getBlendModePreview(refs, 'node-1')).toBe(BlendMode.screen);
  });

  it('should return undefined for a node that is not the one being previewed', () => {
    const refs = createCanvasRefs({ blendMode: { previewRef: { current: { blendMode: BlendMode.screen, nodeId: 'node-1' } } } });

    expect(getBlendModePreview(refs, 'node-2')).toBeUndefined();
  });
});
