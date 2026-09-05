// types
import { TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TEqualSpacingGuides, TMatchedPairGuides } from 'components/Design/Canvas/utils/getEqualSpacingGuides/types';

export const armDragSnapGuides = (
  canvasRefs: TCanvasRefs,
  isAutoLayoutTarget: boolean,
  axisLock: 'x' | 'y' | null,
  guide: TAlignmentGuide | null,
  equalSpacingGuides: TEqualSpacingGuides | null,
  matchedPairGuides: TMatchedPairGuides | null,
): void => {
  canvasRefs.transform.alignmentGuideRef.current = isAutoLayoutTarget || axisLock || matchedPairGuides ? null : guide;
  canvasRefs.transform.equalSpacingGuidesRef.current = isAutoLayoutTarget || axisLock || matchedPairGuides ? null : equalSpacingGuides;
  canvasRefs.transform.matchedPairGuidesRef.current = isAutoLayoutTarget || axisLock ? null : matchedPairGuides;
};
