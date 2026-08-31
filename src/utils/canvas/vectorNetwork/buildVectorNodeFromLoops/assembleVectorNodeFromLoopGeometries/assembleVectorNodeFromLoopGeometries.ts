// types
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';
import { NodeType } from 'types/design/enums';
import { TLoopGeometry, TVectorNodeLoopsBase } from './types';

// utils
import { addBridgeSegments } from './addBridgeSegments';
import { getRingFilledFaceKeys } from './getRingFilledFaceKeys';
import { getSingleLoopFilledFaceKeys } from './getSingleLoopFilledFaceKeys';

export const assembleVectorNodeFromLoopGeometries = (
  loopGeometries: TLoopGeometry[],
  base: TVectorNodeLoopsBase,
  fillColor: string,
): TVectorNode | null => {
  if (loopGeometries.length !== 0) {
    const vertices: Record<string, TVectorVertex> = {};
    const segments: Record<string, TVectorSegment> = {};
    const loopAnchorVertexIds: string[] = [];

    loopGeometries.forEach((loopGeometry) => {
      Object.assign(vertices, loopGeometry.vertices);
      Object.assign(segments, loopGeometry.segments);
      loopAnchorVertexIds.push(Object.keys(loopGeometry.vertices)[0]);
    });

    const bridgeIds = loopAnchorVertexIds.length > 1 ? addBridgeSegments(loopAnchorVertexIds, segments) : [];

    const withoutFillData: TVectorNode = {
      fillColor,
      filledFaceKeys: [],
      id: base.id,
      name: base.name,
      parentId: base.parentId,
      rotation: base.rotation,
      segments,
      strokeColor: fillColor,
      strokeWidth: 0,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    };

    const filledFaceKeys =
      bridgeIds.length > 0 ? getRingFilledFaceKeys(withoutFillData, bridgeIds) : getSingleLoopFilledFaceKeys(withoutFillData);

    return {
      ...withoutFillData,
      fillColorOverrideByKey: Object.fromEntries(filledFaceKeys.map((key) => [key, fillColor])),
      filledFaceKeys,
    };
  }

  return null;
};

export type { TLoopGeometry, TVectorNodeLoopsBase } from './types';
