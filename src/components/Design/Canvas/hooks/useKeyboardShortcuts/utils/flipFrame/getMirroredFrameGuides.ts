// types
import { TFlipAxis } from './types';
import { TFrameNode } from 'types/design/types';
import { TGuide } from 'types/design/guides/types';

export const getMirroredFrameGuides = (frame: TFrameNode, axis: TFlipAxis): TGuide[] | undefined =>
  frame.guides?.map((guide) => {
    switch (true) {
      case axis === 'horizontal' && guide.axis === 'x':
        return { ...guide, position: frame.width - guide.position };
      case axis === 'vertical' && guide.axis === 'y':
        return { ...guide, position: frame.height - guide.position };
      default:
        return guide;
    }
  });
