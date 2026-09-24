// types
import { TBoxSceneNode } from 'types/design/types';
import { TRevealedMinMax } from 'store/design/types';

export const hasBoundOnEvery = (nodes: TBoxSceneNode[], bound: keyof TRevealedMinMax): boolean =>
  nodes.length > 0 && nodes.every((node) => node[bound] !== undefined);
