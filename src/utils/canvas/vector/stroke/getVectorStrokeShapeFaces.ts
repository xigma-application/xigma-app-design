// types
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorStrokeShape } from './getVectorStrokeShape';

export const getVectorStrokeShapeFaces = (node: TVectorNode): { paint: TPaint[]; points: TPoint[][] }[] => {
  const shape = getVectorStrokeShape(node);
  return shape ? [{ paint: [{ color: node.strokeColor, opacity: 100, type: 'solid' }], points: shape.polygons }] : [];
};
