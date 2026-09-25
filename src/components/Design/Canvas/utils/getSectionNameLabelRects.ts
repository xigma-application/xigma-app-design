// others
import { FRAME_NAME_LABEL_HIT_PADDING_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getSectionNameLabelBadgeRect } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawSectionNameLabels/getSectionNameLabelBadgeRect';
import { isNestedSection } from 'utils/canvas/sectionNameLabel/isNestedSection';

export type TSectionNameLabelRect = {
  height: number;
  nodeId: string;
  width: number;
  x: number;
  y: number;
};

const rectsBySource = new WeakMap<TSceneNode[], { nodesById: Record<string, TSceneNode>; rects: TSectionNameLabelRect[]; zoom: number }>();

const collectSectionNameLabelRects = (
  nodes: TSceneNode[],
  zoom: number,
  nodesById: Record<string, TSceneNode>,
): TSectionNameLabelRect[] => {
  const rects: TSectionNameLabelRect[] = [];

  nodes.forEach((node) => {
    if (node.type === NodeType.section && node.name.length > 0) {
      const badge = getSectionNameLabelBadgeRect(node, zoom, isNestedSection(node, nodesById));

      if (badge) {
        const padding = FRAME_NAME_LABEL_HIT_PADDING_PX / zoom;

        rects.push({
          height: badge.height + padding * 2,
          nodeId: node.id,
          width: badge.width + padding * 2,
          x: badge.x - padding,
          y: badge.y - padding,
        });
      }
    }
  });

  return rects;
};

export const getSectionNameLabelRects = (
  nodes: TSceneNode[],
  zoom: number,
  nodesById: Record<string, TSceneNode>,
): TSectionNameLabelRect[] => {
  const cached = rectsBySource.get(nodes);

  if (!cached || cached.zoom !== zoom || cached.nodesById !== nodesById) {
    const rects = collectSectionNameLabelRects(nodes, zoom, nodesById);
    rectsBySource.set(nodes, { nodesById, rects, zoom });

    return rects;
  }

  return cached.rects;
};

export const isPointInSectionNameLabelRect = (point: TPoint, rect: TSectionNameLabelRect): boolean =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
