import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import {
  NODE_ROW_HIDE_ARIA_LABEL_KEY,
  NODE_ROW_LOCK_ARIA_LABEL_KEY,
  NODE_ROW_SHOW_ARIA_LABEL_KEY,
  NODE_ROW_UNLOCK_ARIA_LABEL_KEY,
} from 'components/Design/LeftPanel/File/Layers/constants';

// styles
import styles from './tree-item-actions.module.scss';

export type TTreeItemActionsProps = {
  isHidden: boolean;
  isLocked: boolean;
  onStopPropagation: TFunc<[MouseEvent<HTMLElement>]>;
  onToggleHidden: TFunc;
  onToggleLocked: TFunc;
};

const TreeItemActions: FC<TTreeItemActionsProps> = ({ isHidden, isLocked, onStopPropagation, onToggleHidden, onToggleLocked }) => {
  const { t } = useTranslation();
  const hiddenLabel = t(isHidden ? NODE_ROW_SHOW_ARIA_LABEL_KEY : NODE_ROW_HIDE_ARIA_LABEL_KEY);
  const lockedLabel = t(isLocked ? NODE_ROW_UNLOCK_ARIA_LABEL_KEY : NODE_ROW_LOCK_ARIA_LABEL_KEY);

  return (
    <div className={styles.TreeItemActions} onClick={onStopPropagation}>
      <button
        aria-label={hiddenLabel}
        className={styles.TreeItemActions__action}
        data-tree-item-action="hidden"
        data-tree-item-action-active={isHidden || undefined}
        onClick={onToggleHidden}
        type="button"
      >
        <Icon color="neutral1" name={isHidden ? 'EyesClosed' : 'EyesOpened'} size={16} />
      </button>
      <button
        aria-label={lockedLabel}
        className={styles.TreeItemActions__action}
        data-tree-item-action="locked"
        data-tree-item-action-active={isLocked || undefined}
        onClick={onToggleLocked}
        type="button"
      >
        <Icon color="neutral1" name={isLocked ? 'Lock' : 'Unlock'} size={16} />
      </button>
    </div>
  );
};

export default TreeItemActions;
