// types
import { TBooleanShape } from './types';
import { TDrawSceneContext } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';
import { getBooleanShapeLayers } from './getBooleanShapeLayers';

export const drawBooleanShapeFill = (
  context: TDrawSceneContext,
  shape: TBooleanShape,
  size: { height: number; width: number },
  origin: TPoint,
  color: string,
  alpha: number,
): void => {
  getBooleanShapeLayers(shape).forEach(({ fillRule, polygons }) =>
    drawVectorFill(
      context.gl,
      context.program,
      context.buffer,
      null,
      null,
      polygons,
      color,
      size.width,
      size.height,
      { x: -origin.x, y: -origin.y, zoom: 1 },
      true,
      alpha,
      fillRule,
    ),
  );
};
