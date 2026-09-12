// constant
import { VALUE_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackModeMenuRequest } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { buildGridTracks } from 'store/design/utils/autoLayout/computeGridLayoutPositions/resolveGridLayout/buildGridTracks';
import { DEFAULT_GRID_TRACK } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getGridTrackAffordanceExpandedGeometry } from './getGridTrackAffordanceExpandedGeometry';
import { getGridTrackAffordancePillCenters } from './getGridTrackAffordancePillCenters';
import { getGridTrackAffordancePillOffset } from './getGridTrackAffordancePillOffset';
import { getGridTrackAffordanceValueText } from './getGridTrackAffordanceValueText';
import { getGridTrackLayout } from './getGridTrackLayout';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TGridTrackModeMenuTarget = {
  anchor: TPoint;
  axis: TGridTrackAxis;
  frameId: string;
  index: number;
  mode: SizingMode;
  resolvedSize: number;
  trackValue?: number;
};

export const getGridTrackModeMenuTarget = (
  request: TGridTrackModeMenuRequest,
  nodes: Record<string, TSceneNode>,
  zoom: number,
): TGridTrackModeMenuTarget | null => {
  const frame = nodes[request.frameId];

  if (frame && frame.type === NodeType.frame) {
    const { axis, index } = request;
    const layout = getGridTrackLayout(frame, nodes);
    const cell = { column: axis === 'column' ? index : 0, row: axis === 'row' ? index : 0 };
    const pillOffset = getGridTrackAffordancePillOffset(zoom);
    const pillCenter = getGridTrackAffordancePillCenters(frame, layout, cell, pillOffset)[axis];
    const trackCount = axis === 'column' ? layout.columnCount : layout.rowCount;
    const providedSizes = axis === 'column' ? frame.gridColumnSizes : frame.gridRowSizes;
    const track = buildGridTracks(trackCount, providedSizes, DEFAULT_GRID_TRACK)[index] ?? DEFAULT_GRID_TRACK;
    const resolvedSize = (axis === 'column' ? layout.columnSizes : layout.rowSizes)[index] ?? 0;
    const text = getGridTrackAffordanceValueText(track, resolvedSize);
    const fontSize = VALUE_LABEL_FONT_SIZE_PX / zoom;
    const vertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
    const bounds = getGlyphQuadBounds(vertices);

    if (bounds) {
      const geometry = getGridTrackAffordanceExpandedGeometry(pillCenter, bounds, zoom);
      const frameCenter = getAutoLayoutFrameCenter(frame);
      const chevronBottom = { x: geometry.chevronCenter.x, y: pillCenter.y + geometry.badgeHeight / 2 };
      const anchor = rotatePoint(chevronBottom, frameCenter, frame.rotation);

      return { anchor, axis, frameId: frame.id, index, mode: track.mode, resolvedSize, trackValue: track.value };
    }
  }

  return null;
};
