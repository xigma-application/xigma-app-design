import { FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Menu, MenuCompound, TVirtualAnchor } from 'shared';

// hooks
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  RULER_MENU_HIDE_RULERS_KEY,
  RULER_MENU_REMOVE_ALL_HORIZONTAL_GUIDES_KEY,
  RULER_MENU_REMOVE_ALL_VERTICAL_GUIDES_KEY,
} from './constants';

// styles
import styles from './ruler-context-menu.module.scss';

// types
import { TGuideAxis } from 'types/design/guides/types';

const { MenuItem, MenuSeparator } = MenuCompound;

export type TRulerContextMenuProps = {
  anchorRef: RefObject<TVirtualAnchor>;
  axis: TGuideAxis;
  hasGuides: boolean;
  isOpen: boolean;
  onHideRulers: TFunc;
  onOpenChange: TFunc<[boolean]>;
  onRemoveAllGuides: TFunc;
};

const REMOVE_ALL_GUIDES_KEY_BY_AXIS: Record<TGuideAxis, string> = {
  x: RULER_MENU_REMOVE_ALL_VERTICAL_GUIDES_KEY,
  y: RULER_MENU_REMOVE_ALL_HORIZONTAL_GUIDES_KEY,
};

const RulerContextMenu: FC<TRulerContextMenuProps> = ({
  anchorRef,
  axis,
  hasGuides,
  isOpen,
  onHideRulers,
  onOpenChange,
  onRemoveAllGuides,
}) => {
  const { t } = useTranslation();
  const handlePreventRefocus = usePreventMenuRefocus();
  const handleStopPropagation = useStopClickPropagation();

  return (
    <Menu
      anchorRef={anchorRef}
      className={styles.RulerContextMenu}
      onClick={handleStopPropagation}
      onCloseAutoFocus={handlePreventRefocus}
      onOpenChange={onOpenChange}
      open={isOpen}
      side="bottom"
      sideOffset={0}
    >
      {hasGuides && (
        <>
          <MenuItem label={t(REMOVE_ALL_GUIDES_KEY_BY_AXIS[axis])} onClick={onRemoveAllGuides} withCheck={false} />
          <MenuSeparator />
        </>
      )}
      <MenuItem
        label={t(RULER_MENU_HIDE_RULERS_KEY)}
        onClick={onHideRulers}
        shortcut={KEYBOARD_SHORTCUTS.rulers.join('')}
        withCheck={false}
      />
    </Menu>
  );
};

export default RulerContextMenu;
