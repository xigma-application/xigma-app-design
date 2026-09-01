// types
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

type TMergedNodeFields = {
  fillColorOverrideByKey: Record<string, string>;
  filledFaceKeys: string[];
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};

export const mergeNodeFields = (nodes: TVectorNode[]): TMergedNodeFields => {
  const vertices: Record<string, TVectorVertex> = {};
  const segments: Record<string, TVectorSegment> = {};
  const filledFaceKeys: string[] = [];
  const fillColorOverrideByKey: Record<string, string> = {};

  nodes.forEach((node) => {
    Object.assign(vertices, node.vertices);
    Object.assign(segments, node.segments);
    filledFaceKeys.push(...node.filledFaceKeys);
    Object.assign(fillColorOverrideByKey, node.fillColorOverrideByKey);
  });

  return { fillColorOverrideByKey, filledFaceKeys, segments, vertices };
};
