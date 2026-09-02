// hooks
import { createGuideRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGuideRefs/createGuideRefs';

// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getHighlightedRulerGuide } from '../getHighlightedRulerGuide';

describe('getHighlightedRulerGuide', () => {
  it('should return null when nothing is dragging or hovered', () => {
    // result
    expect(getHighlightedRulerGuide(createGuideRefs(), [])).toBeNull();
  });

  it('should prefer the live dragging position over any hovered guide', () => {
    // mock
    const guides = createGuideRefs({
      draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: true, id: 'guide-1', position: 90 } },
      hoveredGuideRef: { current: { frameId: null, id: 'guide-1' } },
    });

    // result
    expect(getHighlightedRulerGuide(guides, [])).toEqual({ axis: 'x', worldPosition: 90 });
  });

  it('should resolve the hovered guide id against the current guide lines', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'y', frameId: null, id: 'guide-1', span: null, worldPosition: 40 }];
    const guides = createGuideRefs({ hoveredGuideRef: { current: { frameId: null, id: 'guide-1' } } });

    // result
    expect(getHighlightedRulerGuide(guides, guideLines)).toEqual({ axis: 'y', worldPosition: 40 });
  });

  it('should return null when the hovered id no longer matches any guide line', () => {
    // mock
    const guides = createGuideRefs({ hoveredGuideRef: { current: { frameId: null, id: 'missing' } } });

    // result
    expect(getHighlightedRulerGuide(guides, [])).toBeNull();
  });
});
