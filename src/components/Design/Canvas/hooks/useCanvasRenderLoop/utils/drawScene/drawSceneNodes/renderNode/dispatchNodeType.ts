// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { renderFrameNode } from './renderFrameNode';
import { renderGroupNode } from './renderGroupNode';
import { renderMaskNode } from './renderMaskNode';
import { renderSectionNode } from './renderSectionNode';

export const dispatchNodeType = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  switch (node.type) {
    case NodeType.group:
      renderGroupNode(renderer, node, target);
      break;
    case NodeType.mask:
      renderMaskNode(renderer, node, target);
      break;
    case NodeType.frame:
      renderFrameNode(renderer, node, target);
      break;
    case NodeType.section:
      renderSectionNode(renderer, node, target);
      break;
    default:
      renderer.paintLeaf(node);
  }
};
