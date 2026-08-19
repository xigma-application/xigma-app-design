// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getHandleAtBounds } from './getHandleAtBounds';
import { getNodeBounds } from '../getNodeBounds';
import { getSelectionBounds } from '../getSelectionBounds';
import { getUnrotatedQueryPoint } from '../getUnrotatedQueryPoint';
import { isGroupSelection } from '../isGroupSelection';

export const getResizeHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; handle: TResizeHandle; rotation: number } | null => {
  const [singleNode] = selectedNodes;

  if (selectedNodes.length === 1 && singleNode.type !== NodeType.line) {
    const bounds = getNodeBounds(singleNode);
    const testPoint = getUnrotatedQueryPoint(point, bounds, singleNode.rotation);
    const handle = getHandleAtBounds(testPoint, bounds, viewport);

    return handle ? { bounds, handle, rotation: singleNode.rotation } : null;
  }

  if (isGroupSelection(selectedNodes)) {
    const bounds = getSelectionBounds(selectedNodes);
    const handle = getHandleAtBounds(point, bounds, viewport);

    return handle ? { bounds, handle, rotation: 0 } : null;
  }

  return null;
};
