// types
import { TFrameNode, TSceneNode } from 'types/design/types';

export const getFrameChildNodes = (nodes: Record<string, TSceneNode>, frame: TFrameNode): TSceneNode[] =>
  frame.childIds.map((id) => nodes[id]).filter((node): node is TSceneNode => node !== undefined);
