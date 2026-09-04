import { FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { useRotationCommit } from './useRotationCommit';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TButtonGroup } from 'shared/UITools/ButtonGroup/types';

// utils
import { buildRotationButtons } from '../utils/buildRotationButtons';

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
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const rotation = frameNode?.rotation ?? 0;

  const commitRotation = (nextRotation: number): void => {
    dispatch(updateNode({ changes: { rotation: nextRotation }, id }));
  };

  return {
    buttons: buildRotationButtons(id, rotation, dispatch, t),
    onBlur: useRotationCommit(rotation, commitRotation),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onScrub: commitRotation,
    rotation,
  };
};
