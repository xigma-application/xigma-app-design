// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';
import { NodeType } from 'types/design/enums';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { TVectorNodeLoopsBase } from './assembleVectorNodeFromLoopGeometries/assembleVectorNodeFromLoopGeometries';

export const mergeVectorNodeGeometries = (nodes: TVectorNode[], base: TVectorNodeLoopsBase, fillColor: string): TVectorNode | null => {
  if (nodes.length === 0) {
    return null;
  }

  const vertices: Record<string, TVectorVertex> = {};
  const segments: Record<string, TVectorSegment> = {};
  const filledFaceKeys: string[] = [];
  const fillByKey: Record<string, TPaint[]> = {};
  const holeParentByKey: Record<string, string> = {};

  nodes.forEach((node) => {
    Object.assign(vertices, node.vertices);
    Object.assign(segments, node.segments);
    filledFaceKeys.push(...node.filledFaceKeys);
    Object.assign(fillByKey, node.fillByKey);
    Object.assign(holeParentByKey, node.holeParentByKey);
  });

  return {
    defaultFill: [makeSolidPaint(fillColor)],
    fillByKey,
    filledFaceKeys,
    holeParentByKey,
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
};
