// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX, FRAME_NAME_LABEL_HIT_PADDING_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getFrameNameLabelAnchor } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawFrameNameLabels/getFrameNameLabelAnchor';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { truncateTextToWidth } from 'utils/canvas/text/truncateTextToWidth';

export type TFrameNameLabelRect = {
  center: TPoint;
  height: number;
  nodeId: string;
  width: number;
};

export const getFrameNameLabelRects = (nodes: TSceneNode[], zoom: number): TFrameNameLabelRect[] => {
  const rects: TFrameNameLabelRect[] = [];

  nodes.forEach((node) => {
    if (node.type === NodeType.frame && node.name.length > 0) {
      const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / zoom;
      const { maxWidth, point } = getFrameNameLabelAnchor(node, zoom);
      const text = truncateTextToWidth(node.name, maxWidth, fontSize);
      const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
      const bounds = getGlyphQuadBounds(rawVertices);

      if (bounds) {
        const padding = FRAME_NAME_LABEL_HIT_PADDING_PX / zoom;
        const width = bounds.maxX - bounds.minX + padding * 2;
        const height = bounds.maxY - bounds.minY + padding * 2;

        rects.push({ center: { x: point.x + width / 2 - padding, y: point.y + height / 2 - padding }, height, nodeId: node.id, width });
      }
    }
  });

  return rects;
};

export const isPointInFrameNameLabelRect = (point: TPoint, rect: TFrameNameLabelRect): boolean =>
  Math.abs(point.x - rect.center.x) <= rect.width / 2 && Math.abs(point.y - rect.center.y) <= rect.height / 2;
