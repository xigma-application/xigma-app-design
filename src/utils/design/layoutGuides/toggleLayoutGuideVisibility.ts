// types
import { TLayoutGuide } from 'types/design/types';

export const toggleLayoutGuideVisibility = (guides: TLayoutGuide[], index: number): TLayoutGuide[] =>
  guides.map((guide, guideIndex) => (guideIndex === index ? { ...guide, visible: guide.visible === false ? undefined : false } : guide));
