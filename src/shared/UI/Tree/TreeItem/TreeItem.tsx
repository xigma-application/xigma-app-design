import cx from 'classnames';
import { FC } from 'react';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

// components
import TreeItemActions from './TreeItemActions';
import TreeItemIcon from './TreeItemIcon/TreeItemIcon';
import TreeItemToggle from './TreeItemToggle/TreeItemToggle';
import { EditableInput } from 'shared';

// hooks
import { useRenameTreeItem } from './hooks/useRenameTreeItem';
import { useSelectTreeItem } from './hooks/useSelectTreeItem/useSelectTreeItem';
import { useTreeItemActions } from './hooks/useTreeItemActions';
import { useTreeItemContextMenu } from './hooks/useTreeItemContextMenu';
import { useTreeItemNameEditing } from './hooks/useTreeItemNameEditing';

// others
import { NODE_ROW_MASK_BADGE_KEY } from 'components/Design/LeftPanel/File/Layers/constants';
import { TREE_ITEM_INDENT_PX } from '../constants';

// styles
import styles from './tree-item.module.scss';

// types
import { NodeType } from 'types/design/enums';
import { TRenderTreeItemMenu } from './types';
import { TSceneNode } from 'types/design/types';
import { TToggleExpand } from '../types';

export type TTreeItemProps = {
  depth?: number;
  isExpanded?: boolean;
  isSelected: boolean;
  node: TSceneNode;
  onToggleExpand?: TToggleExpand;
  renderMenu?: TRenderTreeItemMenu;
};

export const TreeItem: FC<TTreeItemProps> = ({ depth = 0, isExpanded = false, isSelected, node, onToggleExpand, renderMenu }) => {
  const { t } = useTranslation();
  const handleSelect = useSelectTreeItem(node.id);
  const handleRename = useRenameTreeItem(node.id);
  const { handleStopPropagation, handleToggleHidden, handleToggleLocked } = useTreeItemActions(node.id);
  const { isEditing, isRenameRequested, onEditingChange, onRenameRequested } = useTreeItemNameEditing();
  const { anchorRef, isOpen, onContextMenu, onOpenChange } = useTreeItemContextMenu(node.id);
  const isExpandable = node.type === NodeType.group && node.childIds.length > 0;

  return (
    <div aria-selected={isSelected} className={styles.TreeItem} onClick={handleSelect} onContextMenu={onContextMenu}>
      <div
        className={cx(styles.TreeItem__content, isEditing && styles['TreeItem__content--editing'])}
        style={{ marginLeft: depth * TREE_ITEM_INDENT_PX }}
      >
        <TreeItemToggle isExpandable={isExpandable} isExpanded={isExpanded} onToggleExpand={onToggleExpand ?? noop} />
        <TreeItemIcon className={styles.TreeItem__icon} node={node} size={12} />
        <EditableInput
          autoEdit={isRenameRequested}
          className={cx(styles.TreeItem__name, node.hidden && styles['TreeItem__name--hidden'])}
          editOnDoubleClick
          onChange={handleRename}
          onEditingChange={onEditingChange}
          value={node.name}
        />
        {node.isMask && !isEditing && <span className={styles['TreeItem__mask-badge']}>{t(NODE_ROW_MASK_BADGE_KEY)}</span>}
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
