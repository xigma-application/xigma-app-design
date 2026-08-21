// types
import { TVectorSegment } from 'types/design/types';

export const sharesVertex = (a: TVectorSegment, b: TVectorSegment): boolean =>
  a.startId === b.startId || a.startId === b.endId || a.endId === b.startId || a.endId === b.endId;
