// utils
import { renderClippedFrame } from './renderClippedFrame';
import { renderIds } from './renderIds';
import { renderMaskGroup } from './renderMaskGroup';

// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const renderNode = (renderer: TMaskRenderer, id: string, target: TRenderTarget | null): void => {
  const node = renderer.sceneNodeById.get(id);

  if (node) {
    if (node.type === NodeType.group) {
      const maskIndex = node.childIds.findIndex((childId) => renderer.sceneNodeById.get(childId)?.isMask);

      if (maskIndex === -1) {
        renderIds(renderer, node.childIds, target);
      } else {
        renderMaskGroup(renderer, node, maskIndex, target);
      }
    } else if (node.type === NodeType.frame) {
      renderer.paintLeaf(node);

      if (node.clipContent && node.childIds.length > 0) {
        renderClippedFrame(renderer, node, target);
      } else {
        renderIds(renderer, node.childIds, target);
      }
    } else {
      renderer.paintLeaf(node);
    }
  }
};
