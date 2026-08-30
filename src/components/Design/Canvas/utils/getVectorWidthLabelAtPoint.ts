// others
import { VALUE_LABEL_FONT_SIZE_PX, VALUE_LABEL_OFFSET_PX, VALUE_LABEL_PADDING_X_PX, VALUE_LABEL_PADDING_Y_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TCanvasRefs, TVectorWidthPointHover } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getValueLabelBadgeGeometry } from 'utils/canvas/text/drawValueLabel/getValueLabelBadgeGeometry';
import { getVectorWidthLabelAnchor } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawVectorWidthPointsPreview/getVectorWidthLabelAnchor';
import { getVectorWidthLabelTargets } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawVectorWidthPointsPreview/getVectorWidthLabelTargets';

export const getVectorWidthLabelAtPoint = (
  point: TPoint,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  zoom: number,
): TVectorWidthPointHover | null => {
  const targets = getVectorWidthLabelTargets(refs, nodes);

  for (const target of targets) {
    const anchorInfo = getVectorWidthLabelAnchor(nodes, target);

    if (anchorInfo) {
      const text = String(Math.round(target.point.leftOffset + target.point.rightOffset));
      const fontSize = VALUE_LABEL_FONT_SIZE_PX / zoom;
      const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
      const bounds = getGlyphQuadBounds(rawVertices);

      if (bounds) {
        const { badgeHeight, badgeWidth, center } = getValueLabelBadgeGeometry(
          bounds,
          anchorInfo.anchor,
          anchorInfo.direction,
          VALUE_LABEL_PADDING_X_PX / zoom,
          VALUE_LABEL_PADDING_Y_PX / zoom,
          VALUE_LABEL_OFFSET_PX / zoom,
          undefined,
          zoom,
        );

        if (Math.abs(point.x - center.x) <= badgeWidth / 2 && Math.abs(point.y - center.y) <= badgeHeight / 2) {
          return { nodeId: target.nodeId, segmentId: anchorInfo.segmentId, t: anchorInfo.t };
        }
      }
    }
  }

  return null;
};
