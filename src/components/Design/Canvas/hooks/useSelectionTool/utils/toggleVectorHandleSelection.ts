// types
import { TVectorHandleHover } from 'types/design/canvas/types';

export const toggleVectorHandleSelection = (current: TVectorHandleHover[], handle: TVectorHandleHover): TVectorHandleHover[] =>
  current.some((selected) => selected.end === handle.end && selected.segmentId === handle.segmentId)
    ? current.filter((selected) => !(selected.end === handle.end && selected.segmentId === handle.segmentId))
    : [...current, handle];
