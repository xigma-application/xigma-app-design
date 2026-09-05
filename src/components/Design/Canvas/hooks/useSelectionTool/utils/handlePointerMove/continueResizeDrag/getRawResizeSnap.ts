// types
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getPointAlignmentSnap, TPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';

const isSnappableSingleOrigin = (origin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null): boolean =>
  !origin || (origin.rotation === 0 && 'width' in origin);

export const getRawResizeSnap = (
  queryPoint: TPoint,
  candidateShapes: TCandidateShape[],
  toleranceWorldUnits: number,
  singleRotatableOrigin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null,
): TPointAlignmentSnap =>
  isSnappableSingleOrigin(singleRotatableOrigin)
    ? getPointAlignmentSnap(queryPoint, candidateShapes, toleranceWorldUnits)
    : { guide: null, point: queryPoint };
