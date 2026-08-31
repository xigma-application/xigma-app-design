// store
import { getNextSectionName } from 'store/design/utils/getNextSectionName';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { drawSectionNameLabel } from './drawSectionNameLabel';

export const drawDraftSectionNameLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const { buffer, gl, imageContext, program, viewport } = context;
  const draftShape = refs.draftRef.current;

  if (draftShape?.type === NodeType.section) {
    const draftSection: TSectionNode = {
      fill: draftShape.fill,
      height: draftShape.height,
      id: '',
      name: getNextSectionName(nodes),
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: draftShape.width,
      x: draftShape.x,
      y: draftShape.y,
    };

    drawSectionNameLabel(gl, program, buffer, imageContext, draftSection, canvasWidth, canvasHeight, viewport);
  }
};
