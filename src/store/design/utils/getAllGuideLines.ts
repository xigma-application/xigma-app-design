// types
import { TGuide, TGuideLine } from 'types/design/guides/types';

export const getAllGuideLines = (pageGuides: TGuide[], frameGuides: TGuideLine[]): TGuideLine[] => [
  ...pageGuides.map((guide): TGuideLine => ({ axis: guide.axis, frameId: null, id: guide.id, span: null, worldPosition: guide.position })),
  ...frameGuides,
];
