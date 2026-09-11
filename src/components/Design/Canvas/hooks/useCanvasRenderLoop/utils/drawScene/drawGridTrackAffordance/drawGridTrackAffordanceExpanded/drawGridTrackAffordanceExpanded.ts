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
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getGridTrackAffordanceExpandedGeometry } from 'utils/canvas/gridSlots/getGridTrackAffordanceExpandedGeometry';
import { getGridTrackAffordanceHandleBands } from 'utils/canvas/gridSlots/getGridTrackAffordanceHandleBands';

export const drawGridTrackAffordanceExpanded = (
  context: TDrawSceneContext,
  center: TPoint,
  axis: TGridTrackAxis,
  text: string,
  hoveredHandlePart: TGridTrackAffordanceHandlePart | null,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const fontSize = VALUE_LABEL_FONT_SIZE_PX / viewport.zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  if (bounds) {
    const geometry = getGridTrackAffordanceExpandedGeometry(center, bounds, viewport.zoom);

    drawRect(
      gl,
      program,
      buffer,
      {
        cornerRadius: VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom,
        fill: SIZE_LABEL_FILL,
        height: geometry.badgeHeight,
        width: geometry.badgeWidth,
        x: center.x - geometry.badgeWidth / 2,
        y: center.y - geometry.badgeHeight / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      rotation,
      rotationCenter,
    );

    if (hoveredHandlePart) {
      const bands = getGridTrackAffordanceHandleBands(center, geometry);

      drawGridTrackAffordanceHandleHighlight(context, bands[hoveredHandlePart], rotation, rotationCenter);
    }

    drawGridTrackAffordanceGrip(context, geometry.gripCenter, axis, rotation, rotationCenter);
    drawValueLabelText(gl, imageContext, rawVertices, bounds, geometry.textCenter, rotation, fontSize, canvasWidth, canvasHeight, viewport);
    drawGridTrackAffordanceChevron(context, geometry.chevronCenter, rotation, rotationCenter);
  }
};
