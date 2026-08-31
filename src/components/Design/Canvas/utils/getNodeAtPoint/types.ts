// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TSceneNodeHitContext = {
  lineTolerance: number;
  node: TSceneNode;
  nodesById: Record<string, TSceneNode>;
  pathTextTolerance: number;
  point: TPoint;
  testPoint: TPoint;
  textPathBoundVectorIds: Set<string>;
  zoom: number;
};
