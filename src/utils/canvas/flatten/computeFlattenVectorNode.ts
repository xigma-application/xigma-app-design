// types
import { NodeType } from 'types/design/enums';
import { TNodePaintStyle } from 'store/design/utils/getNodePaintStyle';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { combineVectorNetworks } from '../booleanOperation/combineVectorNetworks';
import { deriveVectorFaces } from '../vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getBooleanFilledFaceKeys } from '../booleanOperation/getBooleanFilledFaceKeys';
import { getVectorRegionPolygons } from '../booleanOperation/getVectorRegionPolygons';
import { isPointInEvenOddPolygons } from '../booleanOperation/isPointInEvenOddPolygons';

export type TFlattenBase = Pick<TVectorNode, 'id' | 'name' | 'parentId'>;

export const computeFlattenVectorNode = (base: TFlattenBase, operands: TVectorNode[], style: TNodePaintStyle): TVectorNode => {
  const regions = operands.filter((operand) => operand.filledFaceKeys.length > 0).map(getVectorRegionPolygons);
  const isInside = (point: TPoint): boolean => regions.some((polygons) => isPointInEvenOddPolygons(point, polygons));
  const combined = combineVectorNetworks(operands);
  const result: TVectorNode = {
    ...base,
    defaultFill: style.fills,
    filledFaceKeys: [],
    rotation: 0,
    segments: combined.segments,
    strokeWidth: (style.strokes ?? []).length > 0 ? (style.strokeWidth ?? 1) : 0,
    strokes: style.strokes ?? [],
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices: combined.vertices,
  };
  const filledFaceKeys = getBooleanFilledFaceKeys(deriveVectorFaces(result), isInside);

  return { ...result, fillByKey: Object.fromEntries(filledFaceKeys.map((key) => [key, style.fills])), filledFaceKeys };
};
