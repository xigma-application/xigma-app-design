// types
import { TBooleanNode } from 'types/design/types';
import { TBooleanShape } from './types';
import { TDraftRect } from 'types/canvas';

export const getBooleanPaintBox = (node: TBooleanNode, shape: TBooleanShape): TDraftRect & { rotation: number } =>
  node.rotation
    ? { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y }
    : { ...shape.bounds, rotation: 0 };
