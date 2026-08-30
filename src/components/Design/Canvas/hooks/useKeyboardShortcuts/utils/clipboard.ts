// types
import { TSceneNode } from 'types/design/types';

export type TClipboardContent = {
  nodes: TSceneNode[];
  rootIds: string[];
};

let clipboardContent: TClipboardContent = { nodes: [], rootIds: [] };

export const setClipboardNodes = (nodes: TSceneNode[], rootIds: string[]): void => {
  clipboardContent = structuredClone({ nodes, rootIds });
};

export const getClipboardNodes = (): TClipboardContent => clipboardContent;
