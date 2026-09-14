// types
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientEllipsePositionAtPoint } from './getGradientEllipsePositionAtPoint';
import { getGradientLinePositionAtPoint } from './getGradientLinePositionAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const getGradientAddStopPositionAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
): { nodeId: string; paintIndex: number; position: number } | null => {
  const [node] = selectedNodes;

  if (gradientEditor && selectedNodes.length === 1 && isAppearanceNode(node)) {
    const paint = node.fills[gradientEditor.paintIndex];

    if (paint?.type === 'gradient-angular') {
      return getGradientEllipsePositionAtPoint(point, selectedNodes, viewport, gradientEditor);
    }
  }

  return getGradientLinePositionAtPoint(point, selectedNodes, viewport, gradientEditor);
};
