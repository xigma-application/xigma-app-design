// others
import { RULER_SIZE_PX } from '../../../RulersLayer/constants';

// types
import { TGuideAxis } from 'types/design/guides/types';
import { TPoint } from 'types/canvas';

export const getGutterAxis = (pointer: TPoint, areRulersVisible: boolean): TGuideAxis | null => {
  if (!areRulersVisible) {
    return null;
  }

  switch (true) {
    case pointer.y < RULER_SIZE_PX && pointer.x >= RULER_SIZE_PX:
      return 'y';
    case pointer.x < RULER_SIZE_PX:
      return 'x';
    default:
      return null;
  }
};
