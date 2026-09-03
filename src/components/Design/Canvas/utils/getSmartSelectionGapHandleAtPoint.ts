// others
import { SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TSmartSelectionGap, TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getGridRowGapHandleBounds } from './getGridRowGapHandleBounds';
import { getSmartSelectionLayout } from './getSmartSelectionLayout/getSmartSelectionLayout';

export type TSmartSelectionGapHit = {
  axis: 'x' | 'y';
  gapIndex: number;
  gapValue: number;
  layout: TSmartSelectionLayout;
  midpoint: TPoint;
};

const findNearestGap = (point: TPoint, gaps: TSmartSelectionGap[], toleranceWorldUnits: number): TSmartSelectionGap | null =>
  gaps.find((gap) => Math.hypot(point.x - gap.midpoint.x, point.y - gap.midpoint.y) <= toleranceWorldUnits) ?? null;

const findRowGapHandle = (
  point: TPoint,
  rowGaps: TSmartSelectionGap[],
  firstColumnWidth: number,
  lastColumnWidth: number,
  toleranceWorldUnits: number,
): { bounds: ReturnType<typeof getGridRowGapHandleBounds>; gap: TSmartSelectionGap } | null => {
  for (const gap of rowGaps) {
    const bounds = getGridRowGapHandleBounds(gap, firstColumnWidth, lastColumnWidth);
    const isWithinHandleSpan = point.x >= bounds.start - toleranceWorldUnits && point.x <= bounds.end + toleranceWorldUnits;
    const isWithinHandleThickness = Math.abs(point.y - gap.midpoint.y) <= toleranceWorldUnits;

    if (isWithinHandleSpan && isWithinHandleThickness) {
      return { bounds, gap };
    }
  }

  return null;
};

export const getSmartSelectionGapHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): TSmartSelectionGapHit | null => {
  const layout = getSmartSelectionLayout(selectedNodes, viewport);
  const tolerance = SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX / viewport.zoom;

  if (layout) {
    if (layout.type === 'grid') {
      const columnHit = findNearestGap(point, layout.columnGaps, tolerance);
      const { columnWidth } = layout.geometry;
      const rowHit = findRowGapHandle(point, layout.rowGaps, columnWidth[0], columnWidth[columnWidth.length - 1], tolerance);

      if (columnHit) {
        return { axis: 'x', gapIndex: columnHit.index, gapValue: columnHit.value, layout, midpoint: columnHit.midpoint };
      }

      if (rowHit) {
        return {
          axis: 'y',
          gapIndex: rowHit.gap.index,
          gapValue: rowHit.gap.value,
          layout,
          midpoint: { x: rowHit.bounds.midX, y: rowHit.gap.midpoint.y },
        };
      }
    } else {
      const hit = findNearestGap(point, layout.gaps, tolerance);

      if (hit) {
        return { axis: layout.type === 'row' ? 'x' : 'y', gapIndex: hit.index, gapValue: hit.value, layout, midpoint: hit.midpoint };
      }
    }
  }

  return null;
};
