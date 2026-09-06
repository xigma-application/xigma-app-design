import { Fragment } from 'react';
import { TFunction } from 'i18next';

// components
import { handleFlipSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleFlipSelection';
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
import { TFrameNode } from 'types/design/types';

const normalizeRotation = (rotation: number): number => Math.round(((((rotation + 90) % 360) + 360) % 360) * 1e4) / 1e4;

export const buildRotationButtons = (frame: TFrameNode | undefined, dispatch: AppDispatch, t: TFunction): TButtonGroup[] => [
  {
    ariaLabel: t(OBJECT_MENU_ROTATE_90_RIGHT_KEY),
    name: 'ToggleRotate',
    onClick: (): void => {
      if (frame) {
        dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
        rotateNodesRigidly(dispatch, frame, normalizeRotation(frame.rotation));
        dispatch(endHistoryGesture());
      }
    },
    tooltip: t(OBJECT_MENU_ROTATE_90_RIGHT_KEY),
  },
  {
    ariaLabel: t(NODE_MENU_FLIP_HORIZONTAL_KEY),
    name: 'FlipHorizontal',
    onClick: (): void => {
      handleFlipSelection(dispatch, 'horizontal');
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
    name: 'FlipVertical',
    onClick: (): void => {
      handleFlipSelection(dispatch, 'vertical');
    },
    tooltip: (
      <Fragment>
        {t(NODE_MENU_FLIP_VERTICAL_KEY)}
        <span className={styles.ColumnRotation__shortcut}>{KEYBOARD_SHORTCUTS.flipVertical.join('')}</span>
      </Fragment>
    ),
  },
];
