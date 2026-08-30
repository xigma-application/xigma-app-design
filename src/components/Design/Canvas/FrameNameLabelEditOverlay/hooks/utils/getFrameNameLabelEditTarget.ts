// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TPoint } from 'types/canvas';

// utils
import { getFrameNameLabelRects, isPointInFrameNameLabelRect } from '../../../utils/getFrameNameLabelRects';

export type TFrameNameLabelEdit = {
  center: TPoint;
  height: number;
  nodeId: string;
  value: string;
  width: number;
};

export const getFrameNameLabelEditTarget = (point: TPoint, state: RootState): TFrameNameLabelEdit | null => {
  const nodes = selectNodes(state);
  const visibleNodes = Object.values(nodes).filter((node) => !node.hidden);
  const rect = getFrameNameLabelRects(visibleNodes, selectViewport(state).zoom).find((candidate) =>
    isPointInFrameNameLabelRect(point, candidate),
  );
  const node = rect ? nodes[rect.nodeId] : null;

  return rect && node ? { center: rect.center, height: rect.height, nodeId: rect.nodeId, value: node.name, width: rect.width } : null;
};
