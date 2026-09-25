// types
import { StrokeDashCap, StrokeProfile } from 'types/design/enums';
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TPoint } from 'types/canvas';
import { TRingMode } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/types';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getBoxBrushStrokePolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxBrushStrokePolygons';
import { getOpenPathDashPolygons } from './getOpenPathDashPolygons';
import { getOpenPathDynamicPolygon } from './getOpenPathDynamicPolygon';
import { getOpenPathProfilePolygon } from './getOpenPathProfilePolygon';
import { getPositivelyWoundPolygon } from 'utils/canvas/line/stroke/getPositivelyWoundPolygon';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';

const toNonZeroShape = (polygons: TPoint[][] | null): TLineStrokeShape | null =>
  polygons ? { fillRule: 'nonZero', polygons: polygons.map(getPositivelyWoundPolygon) } : null;

export const getOpenPathModeShape = (node: TVectorNode, ring: TStrokeRing, mode: TRingMode): TLineStrokeShape | null => {
  switch (mode) {
    case 'brush': {
      const polygons = getBoxBrushStrokePolygons(node, ring);
      return polygons ? { fillRule: 'evenOdd', polygons } : null;
    }
    case 'dynamic': {
      const polygon = getOpenPathDynamicPolygon(ring, getStrokeDynamicValues(node), node.id, node.strokeWidth);
      return toNonZeroShape(polygon ? [polygon] : null);
    }
    case 'dashed':
      return toNonZeroShape(
        getOpenPathDashPolygons(
          ring,
          getStrokeDashPattern(node) as number[],
          node.strokeDashCap ?? StrokeDashCap.none,
          node.strokeWidth / 2,
        ),
      );
    case 'profile':
      return toNonZeroShape([getOpenPathProfilePolygon(ring, node.strokeProfile as StrokeProfile, node.strokeProfileFlipped ?? false)]);
    default:
      return null;
  }
};
