// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getSectionNameLabelBadgeRect } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawSectionNameLabels/getSectionNameLabelBadgeRect';
import { getSectionNameLabelRects, isPointInSectionNameLabelRect } from '../../../utils/getSectionNameLabelRects';
import { isNestedSection } from 'utils/canvas/sectionNameLabel/isNestedSection';

export type TSectionNameLabelEdit = {
  centerY: number;
  height: number;
  left: number;
  nodeId: string;
  value: string;
};

export const getSectionNameLabelEditTarget = (point: TPoint, state: RootState): TSectionNameLabelEdit | null => {
  const nodes = selectNodes(state);
  const zoom = selectViewport(state).zoom;
  const visibleNodes = Object.values(nodes).filter((node) => !node.hidden);
  const rect = getSectionNameLabelRects(visibleNodes, zoom, nodes).find((candidate) => isPointInSectionNameLabelRect(point, candidate));
  const node = rect ? nodes[rect.nodeId] : null;

  if (rect && node?.type === NodeType.section) {
    const badge = getSectionNameLabelBadgeRect(node, zoom, isNestedSection(node, nodes));

    if (badge) {
      return { centerY: badge.y + badge.height / 2, height: badge.textHeight, left: badge.x, nodeId: rect.nodeId, value: node.name };
    }
  }

  return null;
};
