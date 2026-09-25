// others
import { LINE_HIT_TOLERANCE_PX, PATH_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TNodeHitContext } from './types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { findLastNode } from './findLastNode';
import { getFrameNameLabelRects } from '../getFrameNameLabelRects';
import { getNodesById } from './getNodesById';
import { getSectionNameLabelRects } from '../getSectionNameLabelRects';
import { getTextPathBoundVectorIds } from './getTextPathBoundVectorIds';
import { getUnrotatedNodeQueryPoint } from './getUnrotatedNodeQueryPoint';
import { isPointClippedFromNode } from './isPointClippedFromNode';
import { isPointInNodeNameLabel } from './isPointInNodeNameLabel';
import { isPointOnSceneNode } from './isPointOnSceneNode';

export type TGetNodeAtPointOptions = {
  clipNodesById?: Record<string, TSceneNode>;
  ignoreClip?: boolean;
};

const isHit = (node: TSceneNode, context: TNodeHitContext): boolean => {
  const { clipAncestorsById, frameNameLabelRects, ignoreClip, point, sectionNameLabelRects } = context;

  if (!node.hidden && !node.locked) {
    const hitStatus =
      !ignoreClip && isPointClippedFromNode(point, node, clipAncestorsById)
        ? 'clipped'
        : isPointInNodeNameLabel(point, node, frameNameLabelRects, sectionNameLabelRects)
          ? 'inNameLabel'
          : 'needsHitTest';

    switch (hitStatus) {
      case 'clipped':
        return false;
      case 'inNameLabel':
        return true;
      default:
        return isPointOnSceneNode({
          lineTolerance: context.lineTolerance,
          node,
          nodesById: context.nodesById,
          pathTextTolerance: context.pathTextTolerance,
          point,
          testPoint: getUnrotatedNodeQueryPoint(point, node),
          textPathBoundVectorIds: context.textPathBoundVectorIds,
          zoom: context.zoom,
        });
    }
  }

  return false;
};

const isSectionNameLabelHit = (node: TSceneNode, context: TNodeHitContext): boolean =>
  node.type === NodeType.section &&
  isPointInNodeNameLabel(context.point, node, context.frameNameLabelRects, context.sectionNameLabelRects) &&
  isHit(node, context);

export const getNodeAtPoint = (
  point: TPoint,
  nodes: TSceneNode[],
  viewport: TViewport,
  { clipNodesById, ignoreClip = false }: TGetNodeAtPointOptions = {},
): TSceneNode | null => {
  const nodesById = getNodesById(nodes);
  const clipAncestorsById = clipNodesById ?? nodesById;
  const context: TNodeHitContext = {
    clipAncestorsById,
    frameNameLabelRects: getFrameNameLabelRects(nodes, viewport.zoom),
    ignoreClip,
    lineTolerance: LINE_HIT_TOLERANCE_PX / viewport.zoom,
    nodesById,
    pathTextTolerance: PATH_TEXT_HIT_TOLERANCE_PX / viewport.zoom,
    point,
    sectionNameLabelRects: getSectionNameLabelRects(nodes, viewport.zoom, clipAncestorsById),
    textPathBoundVectorIds: getTextPathBoundVectorIds(nodes),
    zoom: viewport.zoom,
  };

  return findLastNode(nodes, (node) => isSectionNameLabelHit(node, context)) ?? findLastNode(nodes, (node) => isHit(node, context));
};
