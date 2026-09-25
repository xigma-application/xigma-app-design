// types
import { TPoint } from 'types/canvas';
import { TFrameNameLabelRect } from '../getFrameNameLabelRects';
import { TSceneNode } from 'types/design/types';
import { TSectionNameLabelRect } from '../getSectionNameLabelRects';

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

export type TNodeHitContext = {
  clipAncestorsById: Record<string, TSceneNode>;
  frameNameLabelRects: TFrameNameLabelRect[];
  hitSlices: boolean;
  ignoreClip: boolean;
  lineTolerance: number;
  nodesById: Record<string, TSceneNode>;
  pathTextTolerance: number;
  point: TPoint;
  sectionNameLabelRects: TSectionNameLabelRect[];
  textPathBoundVectorIds: Set<string>;
  zoom: number;
};
