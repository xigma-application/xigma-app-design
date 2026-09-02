// types
import { TDragState } from 'types/design/selectionTool/types';
import { TEqualSpacingGuides } from '../../../../../utils/getEqualSpacingGuides/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getChainSnap } from '../../../../../utils/getEqualSpacingGuides/getChainSnap';
import { getEligibleDraggedEntries } from '../../../../../utils/getDragAlignmentSnap/getEligibleDraggedEntries';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';

export type TChainGapDragSnap = { delta: TPoint; guides: TEqualSpacingGuides | null };

const ZERO_DELTA: TPoint = { x: 0, y: 0 };
const NO_SNAP: TChainGapDragSnap = { delta: ZERO_DELTA, guides: null };

export const getChainGapDragSnap = (
  nodes: Record<string, TSceneNode>,
  dragState: TDragState,
  delta: TPoint,
  toleranceWorldUnits: number,
): TChainGapDragSnap => {
  const entries = getEligibleDraggedEntries(nodes, dragState.nodeOrigins, Object.keys(dragState.nodeOrigins));

  for (const { node, origin } of entries) {
    const bounds = getRotatedNodeBounds({ ...node, x: origin.x + delta.x, y: origin.y + delta.y } as TSceneNode);
    const snap = getChainSnap(bounds, dragState.candidateShapes, toleranceWorldUnits);

    if (snap.guides.lines.length > 0) {
      return { delta: snap.delta, guides: snap.guides };
    }
  }

  return NO_SNAP;
};
