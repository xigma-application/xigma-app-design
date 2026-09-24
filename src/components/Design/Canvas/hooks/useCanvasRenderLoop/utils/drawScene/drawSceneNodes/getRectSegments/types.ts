// types
import { TRectSegment } from '../types';
import { TSceneNode } from 'types/design/types';

export type TRectSegmentsState = {
  nodesById: Record<string, TSceneNode> | null;
  sceneNodes: TSceneNode[] | null;
  segments: TRectSegment[];
};
