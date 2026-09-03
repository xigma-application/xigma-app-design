// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderFrameNode } from './renderFrameNode';
import { renderGroupNode } from './renderGroupNode';
import { renderSectionNode } from './renderSectionNode';

export const renderNode = (renderer: TMaskRenderer, id: string, target: TRenderTarget | null): void => {
  const node = renderer.sceneNodeById.get(id);

  if (node) {
    switch (node.type) {
      case NodeType.group:
        renderGroupNode(renderer, node, target);
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
  }
};
