// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TPoint } from 'types/canvas';

export const mapVectorEffectLayers = (layers: TLineStrokeShape[], mapPoint: TFunc<[TPoint], TPoint>): TLineStrokeShape[] =>
  layers.map(({ fillRule, polygons }) => ({ fillRule, polygons: polygons.map((polygon) => polygon.map(mapPoint)) }));
