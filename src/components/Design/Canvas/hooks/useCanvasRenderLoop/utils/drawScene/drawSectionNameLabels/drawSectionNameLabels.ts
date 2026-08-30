// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawSectionNameLabel } from './drawSectionNameLabel';

export const drawSectionNameLabels = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  nodes: TSceneNode[],
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const editingNodeId = refs.sectionName.editingLabelRef.current;

  nodes
    .filter((node): node is TSceneNode & { type: NodeType.section } => node.type === NodeType.section && node.id !== editingNodeId)
    .forEach((node) => {
      drawSectionNameLabel(gl, program, buffer, imageContext, node, canvasWidth, canvasHeight, viewport);
    });
};
