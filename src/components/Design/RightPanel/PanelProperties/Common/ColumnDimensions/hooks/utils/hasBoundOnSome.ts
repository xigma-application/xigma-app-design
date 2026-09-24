// types
import { TBoxSceneNode } from 'types/design/types';
import { TRevealedMinMax } from 'store/design/types';

export const hasBoundOnSome = (nodes: TBoxSceneNode[], bound: keyof TRevealedMinMax): boolean =>
  nodes.some((node) => node[bound] !== undefined);
