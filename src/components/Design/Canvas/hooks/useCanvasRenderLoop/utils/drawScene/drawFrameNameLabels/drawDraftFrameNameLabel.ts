// others
import { FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// store
import { getNextFrameName } from 'store/design/utils/getNextFrameName';

// types
import { NodeType } from 'types/design/enums';
import { TDraftEntity, TFrameNode, TSceneNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawFrameNameLabel } from './drawFrameNameLabel';

export const drawDraftFrameNameLabel = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  draftShape: TDraftEntity | null | undefined,
  nodes: Record<string, TSceneNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (draftShape?.type === NodeType.frame) {
    const draftFrame: TFrameNode = {
      fill: draftShape.fill,
      height: draftShape.height,
      id: '',
      name: getNextFrameName(nodes),
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: draftShape.width,
      x: draftShape.x,
      y: draftShape.y,
    };

    drawFrameNameLabel(gl, imageContext, draftFrame, FRAME_NAME_LABEL_SELECTED_FILL, canvasWidth, canvasHeight, viewport);
  }
};
