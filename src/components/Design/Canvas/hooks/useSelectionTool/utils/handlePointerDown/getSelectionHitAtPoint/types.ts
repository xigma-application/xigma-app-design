// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

export type TSelectionHitContext = {
  hit: TSceneNode | null;
  nodesById: Record<string, TSceneNode>;
  point: TPoint;
  selectedHit: TSceneNode | null;
  selectedNodes: TSceneNode[];
  viewport: TViewport;
};

export type TSelectionHitResolver = (context: TSelectionHitContext) => { node: TSceneNode | null } | undefined;
