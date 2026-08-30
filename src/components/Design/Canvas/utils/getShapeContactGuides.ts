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
  NodeType.frame,
  NodeType.media,
  NodeType.polygon,
  NodeType.rectangle,
  NodeType.section,
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
  const verticalOverlap = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);
  const horizontalOverlap = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);

  const getVerticalBridge = (lineAX: number, lineBX: number): TShapeContactGuide[] =>
    verticalOverlap < 0
      ? [aBottom <= bTop ? { x1: lineAX, x2: lineBX, y1: aBottom, y2: bTop } : { x1: lineAX, x2: lineBX, y1: aTop, y2: bBottom }]
      : [];
  const getHorizontalBridge = (lineAY: number, lineBY: number): TShapeContactGuide[] =>
    horizontalOverlap < 0
      ? [aRight <= bLeft ? { x1: aRight, x2: bLeft, y1: lineAY, y2: lineBY } : { x1: aLeft, x2: bRight, y1: lineAY, y2: lineBY }]
      : [];

  switch (true) {
    case isWithinContactTolerance(aRight, bLeft) && verticalOverlap !== 0:
      return [
        { x1: aRight, x2: aRight, y1: aTop, y2: aBottom },
        { x1: bLeft, x2: bLeft, y1: bTop, y2: bBottom },
        ...getVerticalBridge(aRight, bLeft),
      ];
    case isWithinContactTolerance(aLeft, bRight) && verticalOverlap !== 0:
      return [
        { x1: aLeft, x2: aLeft, y1: aTop, y2: aBottom },
        { x1: bRight, x2: bRight, y1: bTop, y2: bBottom },
        ...getVerticalBridge(aLeft, bRight),
      ];
    case isWithinContactTolerance(aBottom, bTop) && horizontalOverlap !== 0:
      return [
        { x1: aLeft, x2: aRight, y1: aBottom, y2: aBottom },
        { x1: bLeft, x2: bRight, y1: bTop, y2: bTop },
        ...getHorizontalBridge(aBottom, bTop),
      ];
    case isWithinContactTolerance(aTop, bBottom) && horizontalOverlap !== 0:
      return [
        { x1: aLeft, x2: aRight, y1: aTop, y2: aTop },
        { x1: bLeft, x2: bRight, y1: bBottom, y2: bBottom },
        ...getHorizontalBridge(aTop, bBottom),
      ];
    case isWithinContactTolerance(aTop, bTop) && horizontalOverlap < 0:
      return [
        { x1: aLeft, x2: aRight, y1: aTop, y2: aTop },
        { x1: bLeft, x2: bRight, y1: bTop, y2: bTop },
        ...getHorizontalBridge(aTop, bTop),
      ];
    case isWithinContactTolerance(aBottom, bBottom) && horizontalOverlap < 0:
      return [
        { x1: aLeft, x2: aRight, y1: aBottom, y2: aBottom },
        { x1: bLeft, x2: bRight, y1: bBottom, y2: bBottom },
        ...getHorizontalBridge(aBottom, bBottom),
      ];
    case isWithinContactTolerance(aLeft, bLeft) && verticalOverlap < 0:
      return [
        { x1: aLeft, x2: aLeft, y1: aTop, y2: aBottom },
        { x1: bLeft, x2: bLeft, y1: bTop, y2: bBottom },
        ...getVerticalBridge(aLeft, bLeft),
      ];
    case isWithinContactTolerance(aRight, bRight) && verticalOverlap < 0:
      return [
        { x1: aRight, x2: aRight, y1: aTop, y2: aBottom },
        { x1: bRight, x2: bRight, y1: bTop, y2: bBottom },
        ...getVerticalBridge(aRight, bRight),
      ];
    default:
      return [];
  }
};

export const getShapeContactGuides = (active: TDraftRect, candidates: TContactGuideCandidate[]): TShapeContactGuide[] =>
  candidates.flatMap((candidate) => getPairContactGuides(active, candidate));
