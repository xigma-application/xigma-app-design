// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawSectionNameLabel } from './drawSectionNameLabel';
import { isNestedSection } from 'utils/canvas/sectionNameLabel/isNestedSection';

export const drawSectionNameLabels = (
  context: TDrawSceneContext,
  nodes: TSceneNode[],
  refs: TCanvasRefs,
  backgroundColor: string,
  nodesById: Record<string, TSceneNode>,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const editingNodeId = refs.sectionName.editingLabelRef.current;

  nodes
    .filter((node): node is TSceneNode & { type: NodeType.section } => node.type === NodeType.section && node.id !== editingNodeId)
    .forEach((node) => {
      drawSectionNameLabel(
        gl,
        program,
        buffer,
        imageContext,
        node,
        canvasWidth,
        canvasHeight,
        viewport,
        backgroundColor,
        isNestedSection(node, nodesById),
      );
    });
};
