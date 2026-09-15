import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import {
  NODE_ROW_HIDE_ARIA_LABEL_KEY,
  NODE_ROW_LOCK_ARIA_LABEL_KEY,
  NODE_ROW_LOCK_TOOLTIP_KEY,
  NODE_ROW_SHOW_ARIA_LABEL_KEY,
  NODE_ROW_UNLOCK_ARIA_LABEL_KEY,
  NODE_ROW_VISIBILITY_TOOLTIP_KEY,
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
      <Tooltip content={t(NODE_ROW_VISIBILITY_TOOLTIP_KEY)}>
        <UITools.ButtonIcon
          ariaLabel={hiddenLabel}
          data-tree-item-action="hidden"
          data-tree-item-action-active={isHidden || undefined}
          name={isHidden ? 'EyesClosed' : 'EyesOpened'}
          onClick={onToggleHidden}
        />
      </Tooltip>
      <Tooltip content={t(NODE_ROW_LOCK_TOOLTIP_KEY)}>
        <UITools.ButtonIcon
          ariaLabel={lockedLabel}
          data-tree-item-action="locked"
          data-tree-item-action-active={isLocked || undefined}
          name={isLocked ? 'Lock' : 'Unlock'}
          onClick={onToggleLocked}
        />
      </Tooltip>
    </div>
  );
};

export default TreeItemActions;
