// types
import { StrokeDashCap, StrokeProfile } from 'types/design/enums';
import { TLineFrame, TLineStrokeShape } from '../types';
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getLineArrowCapPolygons } from './getLineArrowCapPolygons';
import { getLineBrushPolygons } from './getLineBrushPolygons';
import { getLineDashPolygons } from './getLineDashPolygons';
import { getLineDynamicPolygon } from './getLineDynamicPolygon';
import { getLineProfilePolygon } from './getLineProfilePolygon';
import { getLineStrokeMode } from './getLineStrokeMode';
import { getPositivelyWoundPolygon } from './getPositivelyWoundPolygon';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';

const withArrowCaps = (line: TLineNode, frame: TLineFrame, polygons: TPoint[][] | null): TLineStrokeShape | null =>
  polygons
    ? { fillRule: 'nonZero', polygons: [...polygons, ...getLineArrowCapPolygons(line, frame)].map(getPositivelyWoundPolygon) }
    : null;

export const getLineModeStrokeShape = (line: TLineNode, frame: TLineFrame): TLineStrokeShape | null => {
  const dashPattern = getStrokeDashPattern(line);

  switch (getLineStrokeMode(line, dashPattern)) {
    case 'brush': {
      const polygons = getLineBrushPolygons(line, frame);
      return polygons ? { fillRule: 'evenOdd', polygons } : null;
    }
    case 'dynamic': {
      const polygon = getLineDynamicPolygon(frame, getStrokeDynamicValues(line), line.id);
      return withArrowCaps(line, frame, polygon ? [polygon] : null);
    }
    case 'dashed':
      return withArrowCaps(line, frame, getLineDashPolygons(frame, dashPattern as number[], line.strokeDashCap ?? StrokeDashCap.none));
    case 'profile':
      return withArrowCaps(line, frame, [
        getLineProfilePolygon(frame, line.strokeProfile as StrokeProfile, line.strokeProfileFlipped ?? false),
      ]);
    default:
      return null;
  }
};
