import { MouseEvent } from 'react';

// hooks
import { TUsePageRowContextMenuResult, usePageRowContextMenu } from '../PagesList/PageRow/hooks/usePageRowContextMenu';

export const useHeaderPageMenu = (isCollapsed: boolean): TUsePageRowContextMenuResult => {
  const menu = usePageRowContextMenu();

  const onContextMenu = (event: MouseEvent): void => {
    if (isCollapsed) {
      menu.onContextMenu(event);
    }
  };

  return { ...menu, onContextMenu };
};
