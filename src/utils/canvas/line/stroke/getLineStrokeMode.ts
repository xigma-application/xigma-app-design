// types
import { StrokeMode, StrokeProfile } from 'types/design/enums';
import { TLineNode, TVectorNode } from 'types/design/types';
import { TRingMode } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/types';

export const getLineStrokeMode = (
  line: Pick<TLineNode | TVectorNode, 'strokeMode' | 'strokeProfile'>,
  dashPattern: number[] | null,
): TRingMode => {
  switch (true) {
    case line.strokeMode === StrokeMode.brush:
      return 'brush';
    case line.strokeMode === StrokeMode.dynamic:
      return 'dynamic';
    case dashPattern !== null:
      return 'dashed';
    case (line.strokeProfile ?? StrokeProfile.uniform) !== StrokeProfile.uniform:
      return 'profile';
    default:
      return 'uniform';
  }
};
