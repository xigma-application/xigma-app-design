// utils
import { isBatchableRenderRect } from './isBatchableRenderRect';
import { renderNode } from './renderNode/renderNode';
import { renderRectRun } from './renderRectRun';

// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const renderIds = (renderer: TMaskRenderer, ids: string[], target: TRenderTarget | null): void => {
  let run: TBatchShape[] = [];

  ids.forEach((id) => {
    if (!renderer.hoistedIds.has(id)) {
      const node = renderer.sceneNodeById.get(id);

      if (node && isBatchableRenderRect(renderer, node)) {
        run.push(node);
      } else {
        renderRectRun(renderer, run);
        run = [];
        renderNode(renderer, id, target);
      }
    }
  });

  renderRectRun(renderer, run);
};
