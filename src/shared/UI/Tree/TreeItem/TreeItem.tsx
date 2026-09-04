import cx from 'classnames';
import { FC, ReactNode } from 'react';
import { noop } from 'lodash';

// components
import TreeItemActions from './TreeItemActions';
import TreeItemToggle from './TreeItemToggle/TreeItemToggle';
import { UITools } from 'shared';

// hooks
import { useRenameTreeItem } from './hooks/useRenameTreeItem';
import { useSelectTreeItem } from './hooks/useSelectTreeItem/useSelectTreeItem';
import { useTreeItemActions } from './hooks/useTreeItemActions';
import { useTreeItemContextMenu } from './hooks/useTreeItemContextMenu';
import { useTreeItemNameEditing } from './hooks/useTreeItemNameEditing';
import { useZoomToTreeItem } from './hooks/useZoomToTreeItem';

// others
import { TREE_ITEM_INDENT_PX } from '../constants';

// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// styles
import styles from './tree-item.module.scss';

// types
import { TRenderTreeItemMenu } from './types';
import { TSceneNode } from 'types/design/types';
import { TToggleExpand } from '../types';

export type TTreeItemProps = {
  children?: ReactNode;
  depth?: number;
  hideActions?: boolean;
  isExpanded?: boolean;
  isSelected: boolean;
  node: TSceneNode;
  onToggleExpand?: TToggleExpand;
  renderIcon: (node: TSceneNode) => ReactNode;
  renderMenu?: TRenderTreeItemMenu;
};

export const TreeItem: FC<TTreeItemProps> = ({
  children,
  depth = 0,
  hideActions = false,
  isExpanded = false,
  isSelected,
  node,
  onToggleExpand,
  renderIcon,
  renderMenu,
}) => {
  const handleSelect = useSelectTreeItem(node.id);
  const handleRename = useRenameTreeItem(node.id);
  const handleZoomToItem = useZoomToTreeItem(node.id);
  const isExpandable = isContainerNode(node) && node.childIds.length > 0;
  const { handleStopPropagation, handleToggleHidden, handleToggleLocked } = useTreeItemActions(node.id);
  const { isEditing, isRenameRequested, onEditingChange, onRenameRequested } = useTreeItemNameEditing();
  const { anchorRef, isOpen, onContextMenu, onOpenChange } = useTreeItemContextMenu(node.id);

  return (
    <div aria-selected={isSelected} className={styles.TreeItem} onClick={handleSelect} onContextMenu={onContextMenu}>
      <div
        className={cx(styles.TreeItem__content, isEditing && styles['TreeItem__content--editing'])}
        style={{ marginLeft: depth * TREE_ITEM_INDENT_PX }}
      >
        <TreeItemToggle isExpandable={isExpandable} isExpanded={isExpanded} onToggleExpand={onToggleExpand ?? noop} />
        <span className={styles.TreeItem__icon} onDoubleClick={handleZoomToItem}>
          {renderIcon(node)}
        </span>
        <UITools.EditableInput
          autoEdit={isRenameRequested}
          className={cx(styles.TreeItem__name, node.hidden && styles['TreeItem__name--hidden'])}
          editOnDoubleClick
          fitContent
          onChange={handleRename}
          onEditingChange={onEditingChange}
          value={node.name}
        />
        {!isEditing && children}
        {!isEditing && !hideActions && (
          <TreeItemActions
            isHidden={Boolean(node.hidden)}
            isLocked={Boolean(node.locked)}
            onStopPropagation={handleStopPropagation}
            onToggleHidden={handleToggleHidden}
            onToggleLocked={handleToggleLocked}
          />
        )}
      </div>
      {renderMenu?.({
        anchorRef,
        isOpen,
        onOpenChange,
        onRenameRequested,
        onToggleHidden: handleToggleHidden,
        onToggleLocked: handleToggleLocked,
      })}
    </div>
  );
};

export default TreeItem;
