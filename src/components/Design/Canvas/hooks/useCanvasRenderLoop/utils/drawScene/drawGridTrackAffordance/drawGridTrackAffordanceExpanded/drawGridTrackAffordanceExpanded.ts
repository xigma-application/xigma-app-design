// constant
import { SIZE_LABEL_FILL, VALUE_LABEL_CORNER_RADIUS_PX, VALUE_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TDrawSceneContext } from '../../types';
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TPoint } from 'types/canvas';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { drawGridTrackAffordanceChevron } from './drawGridTrackAffordanceChevron';
import { drawGridTrackAffordanceGrip } from './drawGridTrackAffordanceGrip';
import { drawGridTrackAffordanceHandleHighlight } from './drawGridTrackAffordanceHandleHighlight';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawValueLabelText } from 'utils/canvas/text/drawValueLabel/drawValueLabelText';
import { getGlyphQuadBounds, type TGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import {
  getGridTrackAffordanceExpandedGeometry,
  type TGridTrackAffordanceExpandedGeometry,
} from 'utils/canvas/gridSlots/getGridTrackAffordanceExpandedGeometry';
import { getGridTrackAffordanceHandleBands } from 'utils/canvas/gridSlots/getGridTrackAffordanceHandleBands';
import { getGridTrackValueEditBounds } from 'utils/canvas/gridSlots/getGridTrackValueEditBounds';

const drawHoveredHandleHighlight = (
  context: TDrawSceneContext,
  center: TPoint,
  geometry: TGridTrackAffordanceExpandedGeometry,
  hoveredHandlePart: TGridTrackAffordanceHandlePart | null,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  if (hoveredHandlePart) {
    const bands = getGridTrackAffordanceHandleBands(center, geometry);
    drawGridTrackAffordanceHandleHighlight(context, bands[hoveredHandlePart], rotation, rotationCenter);
  }
};

const drawGridTrackValueLabel = (
  context: TDrawSceneContext,
  rawVertices: Float32Array,
  rawBounds: TGlyphQuadBounds | null,
  geometry: TGridTrackAffordanceExpandedGeometry,
  rotation: number,
  fontSize: number,
  isEditing: boolean,
): void => {
  if (!isEditing && rawBounds) {
    const { canvasHeight, canvasWidth, gl, imageContext, viewport } = context;

    drawValueLabelText(
      gl,
      imageContext,
      rawVertices,
      rawBounds,
      geometry.textCenter,
      rotation,
      fontSize,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};

export const drawGridTrackAffordanceExpanded = (
  context: TDrawSceneContext,
  center: TPoint,
  axis: TGridTrackAxis,
  text: string,
  hoveredHandlePart: TGridTrackAffordanceHandlePart | null,
  rotation: number,
  rotationCenter: TPoint,
  isEditing: boolean,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const fontSize = VALUE_LABEL_FONT_SIZE_PX / viewport.zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const rawBounds = getGlyphQuadBounds(rawVertices);
  const bounds = isEditing ? getGridTrackValueEditBounds(text, viewport.zoom) : rawBounds;

  if (bounds) {
    const geometry = getGridTrackAffordanceExpandedGeometry(center, bounds, viewport.zoom);
    const cornerRadius = VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom;
    const x = center.x - geometry.badgeWidth / 2;
    const y = center.y - geometry.badgeHeight / 2;
    const rect = { cornerRadius, fill: SIZE_LABEL_FILL, height: geometry.badgeHeight, width: geometry.badgeWidth, x, y };

    drawRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport, rotation, rotationCenter);
    drawHoveredHandleHighlight(context, center, geometry, hoveredHandlePart, rotation, rotationCenter);
    drawGridTrackAffordanceGrip(context, geometry.gripCenter, axis, rotation, rotationCenter);
    drawGridTrackValueLabel(context, rawVertices, rawBounds, geometry, rotation, fontSize, isEditing);
    drawGridTrackAffordanceChevron(context, geometry.chevronCenter, rotation, rotationCenter);
  }
};
