// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

type TMergedNodeFields = {
  fillByKey: Record<string, TPaint[]>;
  filledFaceKeys: string[];
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};

export const mergeNodeFields = (nodes: TVectorNode[]): TMergedNodeFields => {
  const vertices: Record<string, TVectorVertex> = {};
  const segments: Record<string, TVectorSegment> = {};
  const filledFaceKeys: string[] = [];
  const fillByKey: Record<string, TPaint[]> = {};

  nodes.forEach((node) => {
    Object.assign(vertices, node.vertices);
    Object.assign(segments, node.segments);
    filledFaceKeys.push(...node.filledFaceKeys);
    Object.assign(fillByKey, node.fillByKey);
  });

  return { fillByKey, filledFaceKeys, segments, vertices };
};
