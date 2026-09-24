// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX, SECTION_NAME_LABEL_PADDING_X_PX, SECTION_NAME_LABEL_PADDING_Y_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TSectionNameLabelBadgeRect } from './getSectionNameLabelBadgeRect';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { translateGlyphVertices } from 'utils/canvas/text/translateGlyphVertices';

type TVerticesMemo = { vertices: Float32Array | null; zoom: number };

const verticesByBadge = new WeakMap<TSectionNameLabelBadgeRect, TVerticesMemo>();

const buildVertices = (badge: TSectionNameLabelBadgeRect, zoom: number): Float32Array | null => {
  const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / zoom;
  const paddingX = SECTION_NAME_LABEL_PADDING_X_PX / zoom;
  const paddingY = SECTION_NAME_LABEL_PADDING_Y_PX / zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [badge.text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  return bounds ? translateGlyphVertices(rawVertices, badge.x + paddingX - bounds.minX, badge.y + paddingY - bounds.minY) : null;
};

export const getSectionNameLabelVertices = (badge: TSectionNameLabelBadgeRect, zoom: number): Float32Array | null => {
  const cached = verticesByBadge.get(badge);

  if (!cached || cached.zoom !== zoom) {
    const vertices = buildVertices(badge, zoom);
    verticesByBadge.set(badge, { vertices, zoom });

    return vertices;
  }

  return cached.vertices;
};
