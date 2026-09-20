// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getLayoutGuideRects } from 'utils/canvas/layoutGuides/getLayoutGuideRects';

export const drawLayoutGuides = (context: TDrawSceneContext, sceneNodes: TSceneNode[], areLayoutGuidesVisible: boolean): void => {
  if (areLayoutGuidesVisible) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const lineWidth = 1 / viewport.zoom;

    sceneNodes.forEach((node) => {
      if (node.type === NodeType.frame && node.layoutGuides) {
        const frameCenter = getAutoLayoutFrameCenter(node);

        node.layoutGuides
          .filter((guide) => guide.visible !== false)
          .forEach((guide) => {
            getLayoutGuideRects(guide, node, lineWidth).forEach((rect) => {
              drawRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport, node.rotation, frameCenter);
            });
          });
      }
    });
  }
};
