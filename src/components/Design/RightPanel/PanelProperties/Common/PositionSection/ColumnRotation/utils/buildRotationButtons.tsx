import { Fragment } from 'react';
import { TFunction } from 'i18next';

// components
import { flipImageCropRigidly } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/flipImageCropRigidly';
import { handleFlipSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleFlipSelection';
import { rotateImageCropRigidly } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/rotateImageCropRigidly';
import { rotateNodesRigidly } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueRotateDrag/rotateNodesRigidly';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { NODE_MENU_FLIP_HORIZONTAL_KEY, NODE_MENU_FLIP_VERTICAL_KEY } from 'components/Design/Menu/constants';
import { OBJECT_MENU_ROTATE_90_RIGHT_KEY } from 'components/Design/LeftPanel/NavRail/LogoMenu/ObjectMenu/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// styles
import styles from '../column-rotation.module.scss';

// types
import { TButtonGroup } from 'shared/UITools/ButtonGroup/types';
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

const normalizeRotation = (rotation: number): number => Math.round(((((rotation + 90) % 360) + 360) % 360) * 1e4) / 1e4;

export const buildRotationButtons = (
  node: TBoxSceneNode | undefined,
  dispatch: AppDispatch,
  t: TFunction,
  imageCrop?: TSelectedImageCrop,
): TButtonGroup[] => {
  const isFlipDisabled = imageCrop ? false : !node || node.type === NodeType.section;

  return [
    {
      ariaLabel: t(OBJECT_MENU_ROTATE_90_RIGHT_KEY),
      name: 'ToggleRotate',
      onClick: (): void => {
        if (imageCrop) {
          dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
          rotateImageCropRigidly(dispatch, imageCrop, normalizeRotation(imageCrop.crop.rotation));
          dispatch(endHistoryGesture());
        } else if (node) {
          dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
          rotateNodesRigidly(dispatch, node, normalizeRotation(node.rotation));
          dispatch(endHistoryGesture());
        }
      },
      tooltip: t(OBJECT_MENU_ROTATE_90_RIGHT_KEY),
    },
    {
      ariaLabel: t(NODE_MENU_FLIP_HORIZONTAL_KEY),
      disabled: isFlipDisabled,
      name: 'FlipHorizontal',
      onClick: (): void => {
        if (imageCrop) {
          dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
          flipImageCropRigidly(dispatch, imageCrop, 'horizontal');
          dispatch(endHistoryGesture());
        } else {
          handleFlipSelection(dispatch, 'horizontal');
        }
      },
      tooltip: (
        <Fragment>
          {t(NODE_MENU_FLIP_HORIZONTAL_KEY)}
          <span className={styles.ColumnRotation__shortcut}>{KEYBOARD_SHORTCUTS.flipHorizontal.join('')}</span>
        </Fragment>
      ),
    },
    {
      ariaLabel: t(NODE_MENU_FLIP_VERTICAL_KEY),
      disabled: isFlipDisabled,
      name: 'FlipVertical',
      onClick: (): void => {
        if (imageCrop) {
          dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
          flipImageCropRigidly(dispatch, imageCrop, 'vertical');
          dispatch(endHistoryGesture());
        } else {
          handleFlipSelection(dispatch, 'vertical');
        }
      },
      tooltip: (
        <Fragment>
          {t(NODE_MENU_FLIP_VERTICAL_KEY)}
          <span className={styles.ColumnRotation__shortcut}>{KEYBOARD_SHORTCUTS.flipVertical.join('')}</span>
        </Fragment>
      ),
    },
  ];
};
