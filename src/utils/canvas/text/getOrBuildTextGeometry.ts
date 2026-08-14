// types
import { TEllipseArcLengthSample } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { buildCurvedGlyphQuads } from './buildCurvedGlyphQuads';
import { buildEllipseArcLengthTable } from '../shapes/buildEllipseArcLengthTable';
import { buildGlyphQuads } from './buildGlyphQuads';
import { getEllipseCircumference } from '../shapes/getEllipseCircumference';
import { getFittedPathFontSize } from './getFittedPathFontSize';
import { getWrappedTextLines } from './getWrappedTextLines';

export type TTextGeometry = {
  effectiveFontSize: number;
  vertices: Float32Array;
};

const getOrBuildEllipseArcLengthTable = (
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
  width: number,
  height: number,
): TEllipseArcLengthSample[] => {
  const tableKey = `${width}:${height}`;
  const cachedTable = ellipseArcLengthCache.get(tableKey);
  const table = cachedTable ?? buildEllipseArcLengthTable(width, height);

  if (!cachedTable) {
    ellipseArcLengthCache.set(tableKey, table);
  }

  return table;
};

const buildPathTextGeometry = (
  atlas: TGlyphAtlasJson,
  node: TTextNode,
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
): TTextGeometry => {
  const { content, fontSize, height, pathFlip, pathStartOffset, width, x, y } = node;
  const table = getOrBuildEllipseArcLengthTable(ellipseArcLengthCache, width, height);
  const effectiveFontSize = getFittedPathFontSize(atlas, content, fontSize, getEllipseCircumference(table));
  const center = { x: x + width / 2, y: y + height / 2 };
  const vertices = new Float32Array(
    buildCurvedGlyphQuads(atlas, content, effectiveFontSize, width, height, center, pathStartOffset ?? 0, pathFlip ?? false, table),
  );

  return { effectiveFontSize, vertices };
};

const buildStraightTextGeometry = (atlas: TGlyphAtlasJson, node: TTextNode): TTextGeometry => {
  const { content, fontSize, width, x, y } = node;
  const lines = getWrappedTextLines(atlas, content, width, fontSize);
  const vertices = new Float32Array(buildGlyphQuads(atlas, lines, fontSize, x, y));

  return { effectiveFontSize: fontSize, vertices };
};

export const getOrBuildTextGeometry = (
  atlas: TGlyphAtlasJson,
  cache: Map<string, TTextGeometry>,
  node: TTextNode,
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
): TTextGeometry => {
  const { content, fontFamily, fontSize, height, id, pathFlip, pathId, pathStartOffset, width, x, y } = node;
  const pathKeySuffix = pathId ? `:${pathId}:${pathStartOffset ?? 0}:${pathFlip ?? false}` : '';
  const key = `${id}:${content}:${width}:${height}:${fontSize}:${fontFamily}:${x}:${y}${pathKeySuffix}`;
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const geometry = pathId ? buildPathTextGeometry(atlas, node, ellipseArcLengthCache) : buildStraightTextGeometry(atlas, node);

  cache.set(key, geometry);

  return geometry;
};
