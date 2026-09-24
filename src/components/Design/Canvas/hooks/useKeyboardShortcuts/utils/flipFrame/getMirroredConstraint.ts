// others
import { MIRRORED_HORIZONTAL_ALIGN, MIRRORED_VERTICAL_ALIGN } from './constants';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TFlipAxis } from './types';
import { TNodeAlignment } from 'types/design/types';

export const getMirroredConstraint = (alignment: TNodeAlignment | undefined, axis: TFlipAxis): TNodeAlignment =>
  axis === 'horizontal'
    ? { ...alignment, horizontal: MIRRORED_HORIZONTAL_ALIGN[alignment?.horizontal ?? AlignmentHorizontal.left] }
    : { ...alignment, vertical: MIRRORED_VERTICAL_ALIGN[alignment?.vertical ?? AlignmentVertical.top] };
