import { FocusEvent } from 'react';

// hooks
import { usePositionCommit } from './usePositionCommit';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { commitColumnPosition } from './utils/commitColumnPosition';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';

export type TUseColumnPositionResult = {
  disabledX: boolean;
  disabledY: boolean;
  onBlurX: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurY: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubX: TFunc<[number]>;
  onScrubY: TFunc<[number]>;
  x: number;
  y: number;
};

export const useColumnPosition = (): TUseColumnPositionResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const parentNode = frameNode?.parentId ? nodes[frameNode.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const local = frameNode && parent ? getNodePositionInParent(frameNode, parent) : undefined;
  const x = local ? Math.round(local.x) : (frameNode?.x ?? 0);
  const y = local ? Math.round(local.y) : (frameNode?.y ?? 0);
  const managed = parent !== undefined && isManagedLayoutFrame(parent);

  const commitX = (nextX: number): void => commitColumnPosition(dispatch, id, parent, nextX, y);
  const commitY = (nextY: number): void => commitColumnPosition(dispatch, id, parent, x, nextY);

  return {
    disabledX: managed || frameNode?.alignment?.horizontal !== undefined,
    disabledY: managed || frameNode?.alignment?.vertical !== undefined,
    onBlurX: usePositionCommit(x, commitX),
    onBlurY: usePositionCommit(y, commitY),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrubX: commitX,
    onScrubY: commitY,
    x,
    y,
  };
};
