// types
import { NodeType } from 'types/design/enums';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackValueEditRequest } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { buildGridTracks } from 'store/design/utils/autoLayout/computeGridLayoutPositions/resolveGridLayout/buildGridTracks';
import { DEFAULT_GRID_TRACK } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { getGridTrackAffordancePillCenters } from './getGridTrackAffordancePillCenters';
import { getGridTrackAffordancePillOffset } from './getGridTrackAffordancePillOffset';
import { getGridTrackAffordanceValueText } from './getGridTrackAffordanceValueText';
import { getGridTrackLayout } from './getGridTrackLayout';
import { getGridTrackValueEditGeometry } from './getGridTrackValueEditGeometry';

export type TGridTrackValueEditTarget = {
  axis: TGridTrackAxis;
  badgeHeight: number;
  badgeWidth: number;
  center: TPoint;
  frameId: string;
  index: number;
  pillCenter: TPoint;
  value: string;
};

export const getGridTrackValueEditTarget = (
  request: TGridTrackValueEditRequest,
  nodes: Record<string, TSceneNode>,
  zoom: number,
): TGridTrackValueEditTarget | null => {
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
    const geometry = getGridTrackValueEditGeometry(pillCenter, text, zoom, frame);

    return geometry ? { axis, frameId: frame.id, index, pillCenter, value: text, ...geometry } : null;
  }

  return null;
};
