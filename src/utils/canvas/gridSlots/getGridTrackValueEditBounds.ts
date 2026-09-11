// constant
import {
  GRID_TRACK_AFFORDANCE_VALUE_EDIT_PADDING_PX,
  GRID_TRACK_AFFORDANCE_VALUE_MAX_WIDTH_PX,
  VALUE_LABEL_FONT_SIZE_PX,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds, TGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';

export const getGridTrackValueEditBounds = (text: string, zoom: number): TGlyphQuadBounds | null => {
  const fontSize = VALUE_LABEL_FONT_SIZE_PX / zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  if (bounds) {
    const maxTextWidth = GRID_TRACK_AFFORDANCE_VALUE_MAX_WIDTH_PX / zoom;
    const clampedBounds = bounds.maxX - bounds.minX > maxTextWidth ? { ...bounds, maxX: bounds.minX + maxTextWidth } : bounds;
    const editPadding = GRID_TRACK_AFFORDANCE_VALUE_EDIT_PADDING_PX / zoom;

    return { ...clampedBounds, maxX: clampedBounds.maxX + editPadding, minX: clampedBounds.minX - editPadding };
  }

  return null;
};
