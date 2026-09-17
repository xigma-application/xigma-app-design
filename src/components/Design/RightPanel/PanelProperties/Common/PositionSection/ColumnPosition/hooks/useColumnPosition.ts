import { FocusEvent } from 'react';

// hooks
import { usePositionCommit } from './usePositionCommit';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { commitColumnX } from './utils/commitColumnX';
import { commitColumnY } from './utils/commitColumnY';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';
import { selectSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export type TUseColumnPositionResult = {
  disabledX: boolean;
  disabledY: boolean;
  ignoresAutoLayout: boolean;
  onBlurX: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurY: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubX: TFunc<[number]>;
  onScrubY: TFunc<[number]>;
  onToggleIgnoreAutoLayout: TFunc;
  showIgnoreAutoLayoutToggle: boolean;
  x: number;
  y: number;
};

export const useColumnPosition = (): TUseColumnPositionResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const imageCrop = useAppSelector(selectSelectedImageCrop);
  const node = selectedNode && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const parentNode = node?.parentId ? nodes[node.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const positionSource = imageCrop ? imageCrop.crop : node;
  const local = positionSource && parent ? getNodePositionInParent(positionSource, parent) : undefined;
  const x = local ? Math.round(local.x) : (positionSource?.x ?? 0);
  const y = local ? Math.round(local.y) : (positionSource?.y ?? 0);
  const managed = isManagedLayoutFrame(parent);
  const ignoresAutoLayout = Boolean(node?.ignoreAutoLayout);

  const commitX = (nextX: number): void => commitColumnX(dispatch, imageCrop, id, parent, y, nextX);
  const commitY = (nextY: number): void => commitColumnY(dispatch, imageCrop, id, parent, x, nextY);

  return {
    disabledX: !imageCrop && ((managed && !ignoresAutoLayout) || node?.alignment?.horizontal !== undefined),
    disabledY: !imageCrop && ((managed && !ignoresAutoLayout) || node?.alignment?.vertical !== undefined),
    ignoresAutoLayout,
    onBlurX: usePositionCommit(x, commitX),
    onBlurY: usePositionCommit(y, commitY),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubX: commitX,
    onScrubY: commitY,
    onToggleIgnoreAutoLayout: () => dispatch(updateNode({ changes: { ignoreAutoLayout: ignoresAutoLayout ? undefined : true }, id })),
    showIgnoreAutoLayoutToggle: managed && !imageCrop,
    x,
    y,
  };
};
