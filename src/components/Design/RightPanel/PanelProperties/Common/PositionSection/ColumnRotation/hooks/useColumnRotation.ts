import { FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { rotateNodesRigidly } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/rotateNodesRigidly';

// hooks
import { useRotationCommit } from './useRotationCommit';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TButtonGroup } from 'shared/UITools/ButtonGroup/types';

// utils
import { buildRotationButtons } from '../utils/buildRotationButtons';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TUseColumnRotationResult = {
  buttons: TButtonGroup[];
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  rotation: number;
};

export const useColumnRotation = (): TUseColumnRotationResult => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = selectedNode && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const rotation = node?.rotation ?? 0;

  const commitRotation = (nextRotation: number): void => {
    if (node) {
      rotateNodesRigidly(dispatch, node, nextRotation);
    }
  };

  const commitRotationOnBlur = (nextRotation: number): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    commitRotation(nextRotation);
    dispatch(endHistoryGesture());
  };

  return {
    buttons: buildRotationButtons(node, dispatch, t),
    onBlur: useRotationCommit(rotation, commitRotationOnBlur),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrub: commitRotation,
    rotation,
  };
};
