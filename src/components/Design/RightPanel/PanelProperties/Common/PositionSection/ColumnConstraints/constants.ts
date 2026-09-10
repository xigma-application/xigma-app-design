// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.columnConstraints`;

export const HORIZONTAL_VALUES = [AlignmentHorizontal.left, AlignmentHorizontal.center, AlignmentHorizontal.right] as const;
export const VERTICAL_VALUES = [AlignmentVertical.top, AlignmentVertical.center, AlignmentVertical.bottom] as const;
