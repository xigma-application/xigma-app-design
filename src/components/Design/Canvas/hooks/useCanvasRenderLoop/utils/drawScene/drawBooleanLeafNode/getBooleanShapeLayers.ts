// types
import { TBooleanShape } from './types';
import { TLineStrokeShape } from 'utils/canvas/line/types';

export const getBooleanShapeLayers = (shape: TBooleanShape): TLineStrokeShape[] =>
  shape.layers ?? [{ fillRule: 'evenOdd', polygons: shape.polygons }];
