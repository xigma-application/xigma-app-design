// others
import { IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { formatSvgNumber } from './formatSvgNumber';
import { getSvgImageClipPathDef } from './getSvgImageClipPathDef';
import { getSvgImagePatternDef } from './getSvgImagePatternDef';
import { getSvgImagePlacement } from './getSvgImagePlacement';
import { getSvgRotateTransformValue } from './getSvgRotateTransformValue';
import { loadSvgImageAsset } from './loadSvgImageAsset';
import { registerSvgDef } from './registerSvgDef';
import { toSvgPagePoint } from './toSvgPagePoint';

export type TSvgImageBoxGeometry = { rect: TDraftRect; rotation: number };

const drawSvgImageTile = (
  elements: string[],
  defs: string[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  boxGeometry: TSvgImageBoxGeometry,
  paint: TImagePaint | TVideoPaint,
  dataUrl: string,
  assetWidth: number,
  assetHeight: number,
): void => {
  const scale = paint.scale ?? IMAGE_FILL_DEFAULT_TILE_SCALE;
  const tileWidth = assetWidth * scale;
  const tileHeight = assetHeight * scale;
  const patternTransformValue = getSvgRotateTransformValue(boxGeometry.rotation, boxGeometry.rect, bounds);
  const patternId = registerSvgDef(defs, 'XigmaPattern', (id) =>
    getSvgImagePatternDef(id, dataUrl, tileWidth, tileHeight, patternTransformValue),
  );

  drawSvgPolygons(elements, polygons, `url(#${patternId})`, opacity, bounds);
};

const drawSvgImagePlacedQuad = (
  elements: string[],
  defs: string[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  boxGeometry: TSvgImageBoxGeometry,
  paint: TImagePaint | TVideoPaint,
  dataUrl: string,
): void => {
  const placement = getSvgImagePlacement(paint, boxGeometry.rect, boxGeometry.rotation);
  const clipId = registerSvgDef(defs, 'XigmaClip', (id) => getSvgImageClipPathDef(id, polygons, bounds));
  const point = toSvgPagePoint({ x: placement.rect.x, y: placement.rect.y }, bounds);
  const rotationValue = getSvgRotateTransformValue(placement.rotation, placement.rect, bounds);
  const transformAttribute = rotationValue ? ` transform="${rotationValue}"` : '';
  const opacityAttribute = opacity < 1 ? ` opacity="${formatSvgNumber(opacity)}"` : '';

  elements.push(
    `<image href="${dataUrl}" x="${formatSvgNumber(point.x)}" y="${formatSvgNumber(point.y)}" width="${formatSvgNumber(
      placement.rect.width,
    )}" height="${formatSvgNumber(placement.rect.height)}" preserveAspectRatio="${
      placement.preserveAspectRatio
    }" clip-path="url(#${clipId})"${transformAttribute}${opacityAttribute}/>`,
  );
};

export const drawSvgImagePaint = async (
  elements: string[],
  defs: string[],
  paint: TImagePaint | TVideoPaint,
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  boxGeometry: TSvgImageBoxGeometry,
): Promise<void> => {
  const asset = await loadSvgImageAsset(paint.ref, paint.rotation, paint.flipX ?? false, paint.flipY ?? false);

  if (asset) {
    if (paint.scaleMode === 'tile' && !paint.crop) {
      drawSvgImageTile(elements, defs, polygons, opacity, bounds, boxGeometry, paint, asset.dataUrl, asset.width, asset.height);
    } else {
      drawSvgImagePlacedQuad(elements, defs, polygons, opacity, bounds, boxGeometry, paint, asset.dataUrl);
    }
  }
};
