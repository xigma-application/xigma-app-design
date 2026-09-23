// store
import { AppDispatch } from 'store';

// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFlowAxisMove } from '../getFlowAxisMove';
import { TFrameNode } from 'types/design/types';

// utils
import { buildFlowReorderCandidateIds } from '../buildFlowReorderCandidateIds';
import { dispatchFlowReorder } from './dispatchFlowReorder';
import { getFlowLineGroupsForOrder } from '../getFlowLineGroupsForOrder';
import { getFlowReorderCandidate, TFlowReorderCandidate } from '../getFlowReorderCandidate';
import { isFlowReorderCandidateValid } from '../isFlowReorderCandidateValid';

const getCandidateFlowIds = (lineGroups: string[][], orderedSelectedIds: string[], candidate: TFlowReorderCandidate | null): string[] =>
  candidate ? buildFlowReorderCandidateIds(lineGroups.flat(), orderedSelectedIds, candidate.anchorId, candidate.position) : [];

const isCandidateValid = (
  frame: TFrameNode,
  sizesById: Map<string, TAutoLayoutChildSize>,
  orderedSelectedIds: string[],
  axisMove: TFlowAxisMove,
  candidate: TFlowReorderCandidate | null,
  candidateFlowIds: string[],
): boolean =>
  candidate !== null &&
  isFlowReorderCandidateValid(getFlowLineGroupsForOrder(frame, sizesById, candidateFlowIds), orderedSelectedIds, axisMove);

export const handleForwardOrPrimaryReorder = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  frame: TFrameNode,
  sizesById: Map<string, TAutoLayoutChildSize>,
  orderedSelectedIds: string[],
  lineGroups: string[][],
  siblingLineGroups: string[][],
  axisMove: TFlowAxisMove,
): void => {
  const candidate = getFlowReorderCandidate(lineGroups, siblingLineGroups, orderedSelectedIds, axisMove);
  const candidateFlowIds = getCandidateFlowIds(lineGroups, orderedSelectedIds, candidate);
  const isValid = isCandidateValid(frame, sizesById, orderedSelectedIds, axisMove, candidate, candidateFlowIds);

  if (candidate && isValid) {
    dispatchFlowReorder(dispatch, refs, frame, orderedSelectedIds, candidate.anchorId, candidate.position);
  }
};
