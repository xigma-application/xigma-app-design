import { MouseEvent } from 'react';

// hooks
import { TUseTreeItemContextMenuResult, useTreeItemContextMenu } from 'shared/UI/Tree/TreeItem/hooks/useTreeItemContextMenu';

export const useHeaderPageMenu = (isCollapsed: boolean): TUseTreeItemContextMenuResult => {
  const menu = useTreeItemContextMenu();

  const onContextMenu = (event: MouseEvent): void => {
    if (isCollapsed) {
      menu.onContextMenu(event);
    }
  };

  return { ...menu, onContextMenu };
};
