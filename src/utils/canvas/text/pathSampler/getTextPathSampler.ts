// types
import { TEllipseArcLengthSample } from 'types/canvas';
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TTextPathBox, TTextPathSampler } from './types';

// utils
import { createEllipseTextPathSampler } from './createEllipseTextPathSampler';
import { createVectorTextPathSampler } from './createVectorTextPathSampler/createVectorTextPathSampler';

export const getTextPathSampler = (
  box: TTextPathBox,
  pathNode: TSceneNode | undefined,
  ellipseArcLengthCache?: Map<string, TEllipseArcLengthSample[]>,
): TTextPathSampler =>
  pathNode?.type === NodeType.vector
    ? createVectorTextPathSampler(box, pathNode)
    : createEllipseTextPathSampler(box, ellipseArcLengthCache);
