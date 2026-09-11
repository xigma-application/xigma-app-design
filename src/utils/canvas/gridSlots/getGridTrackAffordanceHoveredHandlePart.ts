// constant
import { VALUE_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';
import { TGridTrackSize } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getGridTrackAffordanceExpandedGeometry } from './getGridTrackAffordanceExpandedGeometry';
import { getGridTrackAffordanceHandleBands } from './getGridTrackAffordanceHandleBands';
import { getGridTrackAffordanceHandlePartAtPoint } from './getGridTrackAffordanceHandlePartAtPoint';
import { getGridTrackAffordanceValueText } from './getGridTrackAffordanceValueText';

export const getGridTrackAffordanceHoveredHandlePart = (
  point: TPoint,
  pillCenter: TPoint,
  track: TGridTrackSize,
  resolvedSize: number,
  zoom: number,
): TGridTrackAffordanceHandlePart | null => {
  const text = getGridTrackAffordanceValueText(track, resolvedSize);
  const fontSize = VALUE_LABEL_FONT_SIZE_PX / zoom;
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  if (bounds) {
    const geometry = getGridTrackAffordanceExpandedGeometry(pillCenter, bounds, zoom);
    const bands = getGridTrackAffordanceHandleBands(pillCenter, geometry);

    return getGridTrackAffordanceHandlePartAtPoint(point, bands);
  }

  return null;
};
