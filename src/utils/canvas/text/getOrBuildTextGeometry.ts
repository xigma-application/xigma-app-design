// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from './buildGlyphQuads';
import { getWrappedTextLines } from './getWrappedTextLines';

export const getOrBuildTextGeometry = (atlas: TGlyphAtlasJson, cache: Map<string, Float32Array>, node: TTextNode): Float32Array => {
  const { content, fontFamily, fontSize, id, width, x, y } = node;
  const key = `${id}:${content}:${width}:${fontSize}:${fontFamily}:${x}:${y}`;
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const lines = getWrappedTextLines(atlas, content, width, fontSize);
  const vertices = new Float32Array(buildGlyphQuads(atlas, lines, fontSize, x, y));

  cache.set(key, vertices);

  return vertices;
};
