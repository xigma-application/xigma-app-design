// types
import { TSceneNode } from 'types/design/types';

let clipboardNodes: TSceneNode[] = [];

export const setClipboardNodes = (nodes: TSceneNode[]): void => {
  clipboardNodes = structuredClone(nodes);
};

export const getClipboardNodes = (): TSceneNode[] => clipboardNodes;
