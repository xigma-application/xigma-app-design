import { FocusEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { rotateNodesRigidly } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/rotateNodesRigidly';

// hooks
import { useRotationCommit } from './useRotationCommit';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TRotationScrubStart } from '../types';
import { TButtonGroup } from 'shared/UITools/ButtonGroup/types';

// utils
import { buildRotationButtons } from '../utils/buildRotationButtons';
import { getMixedOrValue } from 'components/Design/RightPanel/PanelProperties/Common/utils/getMixedOrValue';
import { isExistingBoxSceneNode } from 'components/Design/Canvas/utils/isExistingBoxSceneNode';
import { rotateImageCropRigidly } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/rotateImageCropRigidly';
import { selectSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export type TUseColumnRotationResult = {
  buttons: TButtonGroup[];
  displayRotation: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  rotation: number;
};

export const useColumnRotation = (): TUseColumnRotationResult => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const boxNodes = useAppSelector(selectSelectedNodes).filter(isExistingBoxSceneNode);
  const imageCrop = useAppSelector(selectSelectedImageCrop);
  const [node] = boxNodes;
  const rotation = imageCrop ? imageCrop.crop.rotation : (node?.rotation ?? 0);
  const mixedOrRotation = !imageCrop && boxNodes.length > 1 ? getMixedOrValue(boxNodes.map((boxNode) => boxNode.rotation)) : rotation;
  const displayRotation = mixedOrRotation === 'mixed' ? MIXED_LABEL : `${mixedOrRotation}°`;

  const commitRotation = (nextRotation: number): void => {
    if (imageCrop) {
      rotateImageCropRigidly(dispatch, imageCrop, nextRotation);
    } else {
      boxNodes.forEach((boxNode) => rotateNodesRigidly(dispatch, boxNode, nextRotation));
    }
  };

  const scrubStartRef = useRef<TRotationScrubStart>({ rotation: 0, rotations: {} });

  const scrubRotation = (nextRotation: number): void => {
    if (!imageCrop && boxNodes.length > 1) {
      const start = scrubStartRef.current;

      boxNodes.forEach((boxNode) =>
        rotateNodesRigidly(dispatch, boxNode, (start.rotations[boxNode.id] ?? boxNode.rotation) + nextRotation - start.rotation),
      );
    } else {
      commitRotation(nextRotation);
    }
  };

  const startScrub = (): void => {
    scrubStartRef.current = { rotation, rotations: Object.fromEntries(boxNodes.map((boxNode) => [boxNode.id, boxNode.rotation])) };
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  };

  const commitRotationOnBlur = (nextRotation: number): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    commitRotation(nextRotation);
    dispatch(endHistoryGesture());
  };

  return {
    buttons: buildRotationButtons(boxNodes, dispatch, t, imageCrop),
    displayRotation,
    onBlur: useRotationCommit(displayRotation, commitRotationOnBlur),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: startScrub,
    onScrub: scrubRotation,
    rotation,
  };
};
