// others
import { FRAME_NAME_LABEL_SELECTED_FILL } from 'constant/canvas';

// store
import { getNextFrameName } from 'store/design/utils/getNextFrameName';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { drawFrameNameLabel } from './drawFrameNameLabel';

export const drawDraftFrameNameLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const { gl, imageContext, viewport } = context;
  const draftShape = refs.draftRef.current;

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
