// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// utils
import { buildGlyphQuads } from './buildGlyphQuads';
import { getGlyphQuadBounds } from './getGlyphQuadBounds';

const TEXT_WIDTH_CACHE_MAX_ENTRIES = 4096;

const textWidthCache = new Map<string, number>();

export const getTextWidth = (text: string, fontSize: number): number => {
  const key = `${fontSize}|${text}`;
  const cached = textWidthCache.get(key);

  if (cached === undefined) {
    const vertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
    const bounds = getGlyphQuadBounds(vertices);
    const width = bounds ? bounds.maxX - bounds.minX : 0;

    if (textWidthCache.size >= TEXT_WIDTH_CACHE_MAX_ENTRIES) {
      textWidthCache.clear();
    }

    textWidthCache.set(key, width);

    return width;
  }

  return cached;
};
