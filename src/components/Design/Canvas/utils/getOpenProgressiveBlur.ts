// types
import { NodeType } from 'types/design/enums';
import { TBooleanNode, TEffect, TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TOpenPropertyPanel } from 'store/design/types';

// utils
import { isProgressiveBlur } from 'utils/design/effects/isProgressiveBlur';

export type TOpenProgressiveBlur = {
  effect: TEffect;
  effectIndex: number;
  node: TBooleanNode | TFrameNode | TRectangleNode | TSectionNode;
};

export const getOpenProgressiveBlur = (
  selectedNodes: TSceneNode[],
  openPropertyPanel: TOpenPropertyPanel | null,
): TOpenProgressiveBlur | null => {
  const [node] = selectedNodes;

  if (openPropertyPanel && openPropertyPanel.property === 'effects' && selectedNodes.length === 1 && node.id === openPropertyPanel.nodeId) {
    if ('effects' in node && node.effects && node.type !== NodeType.line) {
      const effect = node.effects[openPropertyPanel.index];

      if (isProgressiveBlur(effect) && effect.visible !== false) {
        return { effect, effectIndex: openPropertyPanel.index, node };
      }
    }
  }

  return null;
};
