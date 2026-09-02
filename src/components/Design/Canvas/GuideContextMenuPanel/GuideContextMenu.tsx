import { FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Menu, MenuCompound, TVirtualAnchor } from 'shared';

// hooks
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';

// others
import { GUIDE_MENU_REMOVE_KEY } from './constants';

// styles
import styles from './guide-context-menu.module.scss';

const { MenuItem } = MenuCompound;

export type TGuideContextMenuProps = {
  anchorRef: RefObject<TVirtualAnchor>;
  isOpen: boolean;
  onOpenChange: TFunc<[boolean]>;
  onRemove: TFunc;
};

const GuideContextMenu: FC<TGuideContextMenuProps> = ({ anchorRef, isOpen, onOpenChange, onRemove }) => {
  const { t } = useTranslation();
  const handlePreventRefocus = usePreventMenuRefocus();
  const handleStopPropagation = useStopClickPropagation();

  return (
    <Menu
      anchorRef={anchorRef}
      className={styles.GuideContextMenu}
      onClick={handleStopPropagation}
      onCloseAutoFocus={handlePreventRefocus}
      onOpenChange={onOpenChange}
      open={isOpen}
      side="bottom"
      sideOffset={0}
    >
      <MenuItem label={t(GUIDE_MENU_REMOVE_KEY)} onClick={onRemove} withCheck={false} />
    </Menu>
  );
};

export default GuideContextMenu;
