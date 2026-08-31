// others
import { LINE_HIT_TOLERANCE_PX, PATH_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getFrameNameLabelRects } from '../getFrameNameLabelRects';
import { getNodesById } from './getNodesById';
import { getSectionNameLabelRects } from '../getSectionNameLabelRects';
import { getTextPathBoundVectorIds } from './getTextPathBoundVectorIds';
import { getUnrotatedNodeQueryPoint } from './getUnrotatedNodeQueryPoint';
import { isPointInNodeNameLabel } from './isPointInNodeNameLabel';
import { isPointOnSceneNode } from './isPointOnSceneNode';

export const getNodeAtPoint = (point: TPoint, nodes: TSceneNode[], viewport: TViewport): TSceneNode | null => {
  const lineTolerance = LINE_HIT_TOLERANCE_PX / viewport.zoom;
  const pathTextTolerance = PATH_TEXT_HIT_TOLERANCE_PX / viewport.zoom;
  const nodesById = getNodesById(nodes);
  const textPathBoundVectorIds = getTextPathBoundVectorIds(nodes);
  const frameNameLabelRects = getFrameNameLabelRects(nodes, viewport.zoom);
  const sectionNameLabelRects = getSectionNameLabelRects(nodes, viewport.zoom);

  const hit = [...nodes].reverse().find((node) => {
    if (!node.hidden && !node.locked) {
      if (!isPointInNodeNameLabel(point, node, frameNameLabelRects, sectionNameLabelRects)) {
        return isPointOnSceneNode({
          lineTolerance,
          node,
          nodesById,
          pathTextTolerance,
          point,
          testPoint: getUnrotatedNodeQueryPoint(point, node),
          textPathBoundVectorIds,
          zoom: viewport.zoom,
        });
      }

      return true;
    }

    return false;
  });

  return hit ?? null;
};
