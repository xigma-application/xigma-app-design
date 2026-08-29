import cx from 'classnames';
import { FC } from 'react';

// components
import TreeItemActions from './TreeItemActions';
import { Icon } from 'shared';

// hooks
import { useSelectTreeItem } from './hooks/useSelectTreeItem';
import { useTreeItemActions } from './hooks/useTreeItemActions';

// others
import { NODE_TYPE_ICON } from './constants';

// styles
import styles from './tree-item.module.scss';

// types
import { TSceneNode } from 'types/design/types';

export type TTreeItemProps = {
  isSelected: boolean;
  node: TSceneNode;
};

const TreeItem: FC<TTreeItemProps> = ({ isSelected, node }) => {
  const handleSelect = useSelectTreeItem(node.id);
  const { handleStopPropagation, handleToggleHidden, handleToggleLocked } = useTreeItemActions(node.id);

  return (
    <div aria-selected={isSelected} className={styles.TreeItem} onClick={handleSelect}>
      <Icon className={styles.TreeItem__icon} color="neutral2" name={NODE_TYPE_ICON[node.type]} size={16} />
      <span className={cx(styles.TreeItem__name, node.hidden && styles['TreeItem__name--hidden'])}>{node.name}</span>
      <TreeItemActions
        isHidden={Boolean(node.hidden)}
        isLocked={Boolean(node.locked)}
        onStopPropagation={handleStopPropagation}
        onToggleHidden={handleToggleHidden}
        onToggleLocked={handleToggleLocked}
      />
    </div>
  );
};

export default TreeItem;
