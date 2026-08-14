// types
import { TGlyphChar } from 'types/msdf';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export type TGlyphQuadRotation = {
  anchor: TPoint;
  angleDegrees: number;
};

export const buildGlyphQuad = (
  glyph: TGlyphChar,
  penX: number,
  penY: number,
  scale: number,
  atlasWidth: number,
  atlasHeight: number,
  rotation?: TGlyphQuadRotation,
): number[] => {
  const left = penX + glyph.xoffset * scale;
  const top = penY + glyph.yoffset * scale;
  const right = left + glyph.width * scale;
  const bottom = top + glyph.height * scale;

  // 2 triangles covering the glyph's quad
  const corners: TPoint[] = [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];

  const positionedCorners = rotation
    ? corners.map((corner) => {
        const rotated = rotatePoint(corner, ORIGIN, rotation.angleDegrees);

        return { x: rotated.x + rotation.anchor.x, y: rotated.y + rotation.anchor.y };
      })
    : corners;

  const u0 = glyph.x / atlasWidth;
  const v0 = glyph.y / atlasHeight;
  const u1 = (glyph.x + glyph.width) / atlasWidth;
  const v1 = (glyph.y + glyph.height) / atlasHeight;
  const uvs = [
    [u0, v0],
    [u1, v0],
    [u1, v1],
    [u0, v0],
    [u1, v1],
    [u0, v1],
  ];

  // interleaved [x, y, u, v] per vertex
  return positionedCorners.flatMap((corner, index) => [corner.x, corner.y, uvs[index][0], uvs[index][1]]);
};
