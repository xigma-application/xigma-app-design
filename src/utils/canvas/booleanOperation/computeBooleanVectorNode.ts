// types
import { NodeType } from 'types/design/enums';
import { TBooleanNode, TVectorNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { combineVectorNetworks } from './combineVectorNetworks';
import { deriveVectorFaces } from '../vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getBooleanFilledFaceKeys } from './getBooleanFilledFaceKeys';
import { getBooleanStrokeColor } from './getBooleanStrokeColor';
import { getRemainingVertices } from '../vectorNetwork/getRemainingVertices';
import { getVectorRegionPolygons } from './getVectorRegionPolygons';
import { isBooleanBoundarySegment } from './isBooleanBoundarySegment';
import { isInsideBooleanResult } from './isInsideBooleanResult';
import { isPointInEvenOddPolygons } from './isPointInEvenOddPolygons';

export const computeBooleanVectorNode = (node: TBooleanNode, operands: TVectorNode[]): TVectorNode | null => {
  if (operands.length !== 0) {
    const regions = operands.map(getVectorRegionPolygons);
    const isInside = (point: TPoint): boolean =>
      isInsideBooleanResult(
        node.booleanOperation,
        regions.map((polygons) => isPointInEvenOddPolygons(point, polygons)),
      );
    const combined = combineVectorNetworks(operands);
    const base: TVectorNode = {
      defaultFill: node.fills,
      filledFaceKeys: [],
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      rotation: 0,
      segments: combined.segments,
      strokeColor: getBooleanStrokeColor(node) ?? '',
      strokeWidth: getBooleanStrokeColor(node) ? (node.strokeWidth ?? 1) : 0,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: combined.vertices,
    };
    const segments = Object.fromEntries(
      Object.entries(combined.segments).filter(([, segment]) => isBooleanBoundarySegment(base, segment, isInside)),
    );
    const result: TVectorNode = { ...base, segments, vertices: getRemainingVertices(combined.vertices, segments) };
    const filledFaceKeys = getBooleanFilledFaceKeys(deriveVectorFaces(result), isInside);

    return { ...result, fillByKey: Object.fromEntries(filledFaceKeys.map((key) => [key, node.fills])), filledFaceKeys };
  }

  return null;
};
