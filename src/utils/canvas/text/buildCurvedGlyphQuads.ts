// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildGlyphQuad } from './buildGlyphQuad';
import { getEllipseCircumference } from '../shapes/getEllipseCircumference';
import { getEllipsePathSample } from '../shapes/getEllipsePathSample';
import { getGlyph } from './getGlyph';
import { getGlyphAdvance } from './getGlyphAdvance';

export const buildCurvedGlyphQuads = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  ellipseWidth: number,
  ellipseHeight: number,
  ellipseCenter: TPoint,
  startOffset: number,
  flip: boolean,
  arcLengthTable: TEllipseArcLengthSample[],
): number[] => {
  const scale = fontSize / atlas.info.size;
  const direction = flip ? -1 : 1;
  const circumference = getEllipseCircumference(arcLengthTable);
  const vertices: number[] = [];
  let cumulativeLength = startOffset * circumference;
  const penY = -(atlas.common.lineHeight * scale) / 2;

  content.split('').forEach((char) => {
    const charCode = char.charCodeAt(0);
    const glyph = getGlyph(atlas, charCode);
    const advance = getGlyphAdvance(atlas, charCode, fontSize);

    if (glyph) {
      const sampleLength = cumulativeLength + direction * (advance / 2);
      const sample = getEllipsePathSample(ellipseWidth, ellipseHeight, arcLengthTable, sampleLength);
      const anchor: TPoint = { x: ellipseCenter.x + sample.x, y: ellipseCenter.y + sample.y };
      const angleDegrees = sample.angleDegrees + (flip ? 180 : 0);

      vertices.push(...buildGlyphQuad(glyph, 0, penY, scale, atlas.common.scaleW, atlas.common.scaleH, { anchor, angleDegrees }));
    }

    cumulativeLength += direction * advance;
  });

  return vertices;
};
