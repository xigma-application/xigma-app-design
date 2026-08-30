// store
import { getNextSectionName } from 'store/design/utils/getNextSectionName';

// types
import { NodeType } from 'types/design/enums';
import { TDraftEntity, TSceneNode, TSectionNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawSectionNameLabel } from './drawSectionNameLabel';

export const drawDraftSectionNameLabel = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  draftShape: TDraftEntity | null | undefined,
  nodes: Record<string, TSceneNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
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
