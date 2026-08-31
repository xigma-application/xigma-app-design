import { MouseEvent } from 'react';

// hooks
import { TUseContextMenuResult, useContextMenu } from 'shared/UI/Tree/hooks/useContextMenu';

export const useHeaderPageMenu = (isCollapsed: boolean): TUseContextMenuResult => {
  const menu = useContextMenu();

  const onContextMenu = (event: MouseEvent): void => {
    if (isCollapsed) {
      menu.onContextMenu(event);
    }
  };

  return { ...menu, onContextMenu };
};
