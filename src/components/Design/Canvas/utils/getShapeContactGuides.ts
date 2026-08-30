// others
import { CONTACT_GUIDE_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TShapeContactGuide = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TContactGuideCandidate = {
  bounds: TDraftRect;
  id: string;
};

const CONTACT_GUIDE_NODE_TYPES: ReadonlySet<NodeType> = new Set([
  NodeType.ellipse,
  NodeType.media,
  NodeType.polygon,
  NodeType.rectangle,
  NodeType.star,
  NodeType.text,
]);

const isAxisAlignedRotation = (rotation: number): boolean => Number.isFinite(rotation) && ((rotation % 90) + 90) % 90 === 0;

export const isContactGuideEligibleNode = (node: TSceneNode): boolean =>
  'rotation' in node && CONTACT_GUIDE_NODE_TYPES.has(node.type) && !node.hidden && isAxisAlignedRotation(node.rotation);

const isWithinContactTolerance = (a: number, b: number): boolean => Math.abs(a - b) <= CONTACT_GUIDE_TOLERANCE_PX;

const getPairContactGuides = (active: TDraftRect, candidate: TContactGuideCandidate): TShapeContactGuide[] => {
  const aLeft = active.x;
  const aRight = active.x + active.width;
  const aTop = active.y;
  const aBottom = active.y + active.height;
  const bLeft = candidate.bounds.x;
  const bRight = candidate.bounds.x + candidate.bounds.width;
  const bTop = candidate.bounds.y;
  const bBottom = candidate.bounds.y + candidate.bounds.height;
  const hasVerticalOverlap = Math.min(aBottom, bBottom) - Math.max(aTop, bTop) > 0;
  const hasHorizontalOverlap = Math.min(aRight, bRight) - Math.max(aLeft, bLeft) > 0;

  switch (true) {
    case hasVerticalOverlap && isWithinContactTolerance(aRight, bLeft):
      return [
        { x1: aRight, x2: aRight, y1: aTop, y2: aBottom },
        { x1: bLeft, x2: bLeft, y1: bTop, y2: bBottom },
      ];
    case hasVerticalOverlap && isWithinContactTolerance(aLeft, bRight):
      return [
        { x1: aLeft, x2: aLeft, y1: aTop, y2: aBottom },
        { x1: bRight, x2: bRight, y1: bTop, y2: bBottom },
      ];
    case hasHorizontalOverlap && isWithinContactTolerance(aBottom, bTop):
      return [
        { x1: aLeft, x2: aRight, y1: aBottom, y2: aBottom },
        { x1: bLeft, x2: bRight, y1: bTop, y2: bTop },
      ];
    case hasHorizontalOverlap && isWithinContactTolerance(aTop, bBottom):
      return [
        { x1: aLeft, x2: aRight, y1: aTop, y2: aTop },
        { x1: bLeft, x2: bRight, y1: bBottom, y2: bBottom },
      ];
    default:
      return [];
  }
};

export const getShapeContactGuides = (active: TDraftRect, candidates: TContactGuideCandidate[]): TShapeContactGuide[] =>
  candidates.flatMap((candidate) => getPairContactGuides(active, candidate));
