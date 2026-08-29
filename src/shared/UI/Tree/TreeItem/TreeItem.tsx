import cx from 'classnames';
import { FC } from 'react';

// components
import TreeItemActions from './TreeItemActions';
import TreeItemIcon from './TreeItemIcon/TreeItemIcon';
import { EditableInput } from 'shared';

// hooks
import { useRenameTreeItem } from './hooks/useRenameTreeItem';
import { useSelectTreeItem } from './hooks/useSelectTreeItem/useSelectTreeItem';
import { useTreeItemActions } from './hooks/useTreeItemActions';
import { useTreeItemNameEditing } from './hooks/useTreeItemNameEditing';

// styles
import styles from './tree-item.module.scss';

// types
import { TSceneNode } from 'types/design/types';

export type TTreeItemProps = {
  isSelected: boolean;
  node: TSceneNode;
};

export const TreeItem: FC<TTreeItemProps> = ({ isSelected, node }) => {
  const handleSelect = useSelectTreeItem(node.id);
  const handleRename = useRenameTreeItem(node.id);
  const { handleStopPropagation, handleToggleHidden, handleToggleLocked } = useTreeItemActions(node.id);
  const { isEditing, onEditingChange } = useTreeItemNameEditing();

  return (
    <div aria-selected={isSelected} className={styles.TreeItem} onClick={handleSelect}>
      <div className={cx(styles.TreeItem__content, isEditing && styles['TreeItem__content--editing'])}>
        <div className={styles.TreeItem__toggle} />
        <TreeItemIcon className={styles.TreeItem__icon} node={node} size={10} />
        <EditableInput
          className={cx(styles.TreeItem__name, node.hidden && styles['TreeItem__name--hidden'])}
          editOnDoubleClick
          onChange={handleRename}
          onEditingChange={onEditingChange}
          value={node.name}
        />
        {!isEditing && (
          <TreeItemActions
            isHidden={Boolean(node.hidden)}
            isLocked={Boolean(node.locked)}
            onStopPropagation={handleStopPropagation}
            onToggleHidden={handleToggleHidden}
            onToggleLocked={handleToggleLocked}
          />
        )}
      </div>
    </div>
  );
};

export default TreeItem;
