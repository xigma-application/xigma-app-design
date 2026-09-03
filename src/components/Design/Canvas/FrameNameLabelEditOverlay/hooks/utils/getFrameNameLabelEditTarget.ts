// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getFrameNameLabelAnchor } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawFrameNameLabels/getFrameNameLabelAnchor';
import { getFrameNameLabelRects, isPointInFrameNameLabelRect } from '../../../utils/getFrameNameLabelRects';
import { isNestedFrame } from 'store/design/utils/nodeHierarchy/isNestedFrame';

export type TFrameNameLabelEdit = {
  angleDeg: number;
  centerY: number;
  height: number;
  left: number;
  nodeId: string;
  value: string;
};

export const getFrameNameLabelEditTarget = (point: TPoint, state: RootState): TFrameNameLabelEdit | null => {
  const nodes = selectNodes(state);
  const zoom = selectViewport(state).zoom;
  const visibleNodes = Object.values(nodes).filter((node) => !node.hidden && !isNestedFrame(node, nodes));
  const rect = getFrameNameLabelRects(visibleNodes, zoom).find((candidate) => isPointInFrameNameLabelRect(point, candidate));
  const node = rect ? nodes[rect.nodeId] : null;

  if (rect && node && node.type === NodeType.frame) {
    const anchor = getFrameNameLabelAnchor(node, zoom);

    return {
      angleDeg: anchor.angleDeg,
      centerY: rect.center.y,
      height: rect.height,
      left: anchor.point.x,
      nodeId: rect.nodeId,
      value: node.name,
    };
  }

  return null;
};
