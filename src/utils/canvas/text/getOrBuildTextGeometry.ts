// types
import { TEllipseArcLengthSample } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { buildCurvedGlyphQuads } from './buildCurvedGlyphQuads';
import { buildGlyphQuads } from './buildGlyphQuads';
import { getTextPathSampler } from './pathSampler/getTextPathSampler';
import { getVectorChainGeometrySignature } from '../vectorNetwork/getVectorChainGeometrySignature';
import { getVisibleCurvedContent } from './getVisibleCurvedContent';
import { getWrappedTextLines } from './getWrappedTextLines';

export type TTextGeometry = {
  effectiveFontSize: number;
  vertices: Float32Array;
};

const buildPathTextGeometry = (
  atlas: TGlyphAtlasJson,
  node: TTextNode,
  pathNode: TSceneNode | undefined,
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
): TTextGeometry => {
  const { content, fontSize, height, pathFlip, pathStartOffset, width, x, y } = node;
  const sampler = getTextPathSampler({ height, rotation: node.rotation, width, x, y }, pathNode, ellipseArcLengthCache);
  const visibleContent = getVisibleCurvedContent(
    atlas,
    content,
    fontSize,
    pathStartOffset ?? 0,
    pathFlip ?? false,
    sampler.totalLength,
    sampler.isClosed,
  );
  const center = { x: x + width / 2, y: y + height / 2 };
  const vertices = new Float32Array(
    buildCurvedGlyphQuads(atlas, visibleContent, fontSize, center, pathStartOffset ?? 0, pathFlip ?? false, sampler),
  );

  return { effectiveFontSize: fontSize, vertices };
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
  pathNode?: TSceneNode,
): TTextGeometry => {
  const { content, fontFamily, fontSize, height, id, pathFlip, pathId, pathStartOffset, width, x, y } = node;
  const vectorSignatureSuffix = pathNode?.type === NodeType.vector ? `:${getVectorChainGeometrySignature(pathNode)}` : '';
  const pathKeySuffix = pathId ? `:${pathId}:${pathStartOffset ?? 0}:${pathFlip ?? false}${vectorSignatureSuffix}` : '';
  const key = `${id}:${content}:${width}:${height}:${fontSize}:${fontFamily}:${x}:${y}${pathKeySuffix}`;
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const geometry = pathId ? buildPathTextGeometry(atlas, node, pathNode, ellipseArcLengthCache) : buildStraightTextGeometry(atlas, node);

  cache.set(key, geometry);

  return geometry;
};
