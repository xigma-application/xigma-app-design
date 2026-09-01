import { FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Menu, MenuCompound, TVirtualAnchor } from 'shared';

// hooks
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  CANVAS_MENU_ACTIONS_KEY,
  CANVAS_MENU_CURSOR_CHAT_KEY,
  CANVAS_MENU_PASTE_HERE_KEY,
  CANVAS_MENU_SHOW_HIDE_COMMENTS_KEY,
  CANVAS_MENU_SHOW_HIDE_UI_KEY,
  NODE_MENU_PLUGINS_KEY,
  NODE_MENU_WIDGETS_KEY,
} from '../constants';

// styles
import styles from './canvas-context-menu.module.scss';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

export type TCanvasContextMenuProps = {
  anchorRef: RefObject<TVirtualAnchor>;
  isOpen: boolean;
  onOpenChange: TFunc<[boolean]>;
  onToggleUiMinimized: TFunc;
};

const CanvasContextMenu: FC<TCanvasContextMenuProps> = ({ anchorRef, isOpen, onOpenChange, onToggleUiMinimized }) => {
  const { t } = useTranslation();
  const handlePreventRefocus = usePreventMenuRefocus();
  const handleStopPropagation = useStopClickPropagation();

  return (
    <Menu
      anchorRef={anchorRef}
      className={styles.CanvasContextMenu}
      onClick={handleStopPropagation}
      onCloseAutoFocus={handlePreventRefocus}
      onOpenChange={onOpenChange}
      open={isOpen}
      side="bottom"
      sideOffset={0}
    >
      <MenuItem disabled label={t(CANVAS_MENU_PASTE_HERE_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem
        label={t(CANVAS_MENU_SHOW_HIDE_UI_KEY)}
        onClick={onToggleUiMinimized}
        shortcut={KEYBOARD_SHORTCUTS.showHideUi.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(CANVAS_MENU_SHOW_HIDE_COMMENTS_KEY)} shortcut={KEYBOARD_SHORTCUTS.comments.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(CANVAS_MENU_CURSOR_CHAT_KEY)} shortcut={KEYBOARD_SHORTCUTS.cursorChat.join('')} withCheck={false} />
      <MenuItem disabled label={t(CANVAS_MENU_ACTIONS_KEY)} shortcut={KEYBOARD_SHORTCUTS.openActions.join('')} withCheck={false} />
      <MenuSub disabled label={t(NODE_MENU_PLUGINS_KEY)} withCheck={false} />
      <MenuSub disabled label={t(NODE_MENU_WIDGETS_KEY)} withCheck={false} />
    </Menu>
  );
};

export default CanvasContextMenu;
