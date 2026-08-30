// types
import { TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextPathSampler } from './pathSampler/types';

// utils
import { buildGlyphQuad } from './buildGlyphQuad';
import { getGlyph } from './getGlyph';
import { getGlyphAdvance } from './getGlyphAdvance';

export const buildCurvedGlyphQuads = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  pathCenter: TPoint,
  startOffset: number,
  flip: boolean,
  sampler: TTextPathSampler,
): number[] => {
  const scale = fontSize / atlas.info.size;
  const direction = flip ? -1 : 1;
  const vertices: number[] = [];
  let cumulativeLength = startOffset * sampler.totalLength;
  const penY = -(atlas.common.lineHeight * scale) / 2;

  content.split('').forEach((char) => {
    const charCode = char.charCodeAt(0);
    const glyph = getGlyph(atlas, charCode);
    const advance = getGlyphAdvance(atlas, charCode, fontSize);

    if (glyph) {
      const sample = sampler.sampleAtLength(cumulativeLength);
      const anchor: TPoint = { x: pathCenter.x + sample.x, y: pathCenter.y + sample.y };
      const angleDegrees = sample.angleDegrees + (flip ? 180 : 0);

      vertices.push(...buildGlyphQuad(glyph, 0, penY, scale, atlas.common.scaleW, atlas.common.scaleH, { anchor, angleDegrees }));
    }

    cumulativeLength += direction * advance;
  });

  return vertices;
};
