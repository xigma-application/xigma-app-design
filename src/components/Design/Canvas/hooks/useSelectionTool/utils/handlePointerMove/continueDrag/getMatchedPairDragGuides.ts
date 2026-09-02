// types
import { TDragState } from 'types/design/selectionTool/types';
import { TMatchedPairGuides } from '../../../../../utils/getEqualSpacingGuides/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getEligibleDraggedEntries } from '../../../../../utils/getDragAlignmentSnap/getEligibleDraggedEntries';
import { getMatchedPairGuides } from '../../../../../utils/getEqualSpacingGuides/getMatchedPairGuides/getMatchedPairGuides';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';

const NO_MATCH: TMatchedPairGuides = { labels: [], lines: [], markers: [] };

export const getMatchedPairDragGuides = (
  nodes: Record<string, TSceneNode>,
  dragState: TDragState,
  delta: TPoint,
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TMatchedPairGuides | null => {
  const entries = getEligibleDraggedEntries(nodes, dragState.nodeOrigins, Object.keys(dragState.nodeOrigins));
  const perChildGuides = entries.map(({ node, origin }) => {
    const bounds = getRotatedNodeBounds({ ...node, x: origin.x + delta.x, y: origin.y + delta.y } as TSceneNode);

    return getMatchedPairGuides(bounds, dragState.candidateShapes, sizeToleranceWorldUnits, centreToleranceWorldUnits);
  });
  const merged = perChildGuides.reduce(
    (acc, guides) => ({
      labels: acc.labels.concat(guides.labels),
      lines: acc.lines.concat(guides.lines),
      markers: acc.markers.concat(guides.markers),
    }),
    NO_MATCH,
  );

  return merged.lines.length > 0 ? merged : null;
};
