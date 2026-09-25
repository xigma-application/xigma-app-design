// types
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxStrokeProfilePolygons } from '../getBoxStrokeProfilePolygons';
import { getBrushRingPolygons } from './getBrushRingPolygons';
import { getDashedRingPolygons } from './getDashedRingPolygons';
import { getDynamicRingPolygons } from './getDynamicRingPolygons';
import { getRingMode } from './getRingMode';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getUniformRingPolygons } from './getUniformRingPolygons';

export const getBoxStrokeRingPolygons = (node: TFrameNode | TRectangleNode | TSectionNode): TPoint[][] => {
  const dashPattern = getStrokeDashPattern(node);

  switch (getRingMode(node, dashPattern)) {
    case 'brush':
      return getBrushRingPolygons(node);
    case 'dynamic':
      return getDynamicRingPolygons(node);
    case 'dashed':
      return getDashedRingPolygons(node, dashPattern);
    case 'profile':
      return getBoxStrokeProfilePolygons(node);
    default:
      return getUniformRingPolygons(node);
  }
};
