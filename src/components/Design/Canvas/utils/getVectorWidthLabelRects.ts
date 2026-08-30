// others
import { VALUE_LABEL_FONT_SIZE_PX, VALUE_LABEL_OFFSET_PX, VALUE_LABEL_PADDING_X_PX, VALUE_LABEL_PADDING_Y_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getValueLabelBadgeGeometry } from 'utils/canvas/text/drawValueLabel/getValueLabelBadgeGeometry';
import { getVectorWidthLabelAnchor } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawVectorWidthPointsPreview/getVectorWidthLabelAnchor';
import {
  getVectorWidthLabelTargets,
  type TVectorWidthLabelTarget,
} from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawVectorWidthPointsPreview/getVectorWidthLabelTargets';

export type TVectorWidthLabelRect = {
  badgeHeight: number;
  badgeWidth: number;
  center: TPoint;
  segmentId: string;
  t: number;
  target: TVectorWidthLabelTarget;
};

export const getVectorWidthLabelRects = (refs: TCanvasRefs, nodes: Record<string, TSceneNode>, zoom: number): TVectorWidthLabelRect[] => {
  const rects: TVectorWidthLabelRect[] = [];

  getVectorWidthLabelTargets(refs, nodes).forEach((target) => {
    const anchorInfo = getVectorWidthLabelAnchor(nodes, target);

    if (anchorInfo) {
      const text = String(Math.round(target.point.leftOffset + target.point.rightOffset));
      const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], VALUE_LABEL_FONT_SIZE_PX / zoom, 0, 0));
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

        rects.push({ badgeHeight, badgeWidth, center, segmentId: anchorInfo.segmentId, t: anchorInfo.t, target });
      }
    }
  });

  return rects;
};

export const isPointInVectorWidthLabelRect = (point: TPoint, rect: TVectorWidthLabelRect): boolean =>
  Math.abs(point.x - rect.center.x) <= rect.badgeWidth / 2 && Math.abs(point.y - rect.center.y) <= rect.badgeHeight / 2;
