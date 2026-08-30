// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// utils
import { buildGlyphQuads } from './buildGlyphQuads';
import { getGlyphQuadBounds } from './getGlyphQuadBounds';

export const getTextWidth = (text: string, fontSize: number): number => {
  const vertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(vertices);

  return bounds ? bounds.maxX - bounds.minX : 0;
};
