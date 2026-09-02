// others
import { RULER_SIZE_PX } from '../../../RulersLayer/constants';

// types
import { TPoint } from 'types/canvas';

export type TRulerGutterSide = 'left' | 'top';

export const getRulerGutterSide = (pointer: TPoint, areRulersVisible: boolean, leftInset: number): TRulerGutterSide | null => {
  if (areRulersVisible) {
    switch (true) {
      case pointer.y < RULER_SIZE_PX && pointer.x >= leftInset + RULER_SIZE_PX:
        return 'top';
      case pointer.x >= leftInset && pointer.x < leftInset + RULER_SIZE_PX:
        return 'left';
      default:
        return null;
    }
  }

  return null;
};
