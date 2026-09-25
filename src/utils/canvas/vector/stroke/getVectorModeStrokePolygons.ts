// types
import { StrokeDashCap, StrokeProfile } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TEllipseNode, TPolygonNode, TStarNode, TVectorNode } from 'types/design/types';

// utils
import { buildStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/buildStrokeRing';
import { getBoxBrushStrokePolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxBrushStrokePolygons';
import { getBoxDashedStrokePolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxDashedStrokePolygons';
import { getBoxDynamicStrokePolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxDynamicStrokePolygons';
import { getLineStrokeMode } from 'utils/canvas/line/stroke/getLineStrokeMode';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { getVectorProfileRingPolygons } from './getVectorProfileRingPolygons';

export const getVectorModeStrokePolygons = (
  node: TEllipseNode | TPolygonNode | TStarNode | TVectorNode,
  loop: TPoint[],
): TPoint[][] | null => {
  const dashPattern = getStrokeDashPattern(node);
  const strokeWidth = node.strokeWidth ?? 0;
  const halfWidth = strokeWidth / 2;
  const { inner, outer } = getStrokeOutlinePolygons(loop, halfWidth, true);

  switch (getLineStrokeMode(node, dashPattern)) {
    case 'brush':
      return getBoxBrushStrokePolygons(node, buildStrokeRing(outer, inner));
    case 'dynamic':
      return getBoxDynamicStrokePolygons(outer, inner, { ...getStrokeDynamicValues(node), seed: node.id, strokeWidth });
    case 'dashed':
      return getBoxDashedStrokePolygons(outer, inner, dashPattern as number[], node.strokeDashCap ?? StrokeDashCap.none);
    case 'profile':
      return getVectorProfileRingPolygons(loop, halfWidth, node.strokeProfile as StrokeProfile, node.strokeProfileFlipped ?? false);
    default:
      return null;
  }
};
