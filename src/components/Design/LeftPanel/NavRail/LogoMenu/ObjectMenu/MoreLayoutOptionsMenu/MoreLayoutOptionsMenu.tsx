import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// hooks
import { useResizeToFitSelection } from 'components/Design/Menu/hooks/useResizeToFitSelection';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  MORE_LAYOUT_OPTIONS_MENU_LOCK_ASPECT_RATIO_KEY,
  MORE_LAYOUT_OPTIONS_MENU_REMOVE_ALL_AUTO_LAYOUT_KEY,
  MORE_LAYOUT_OPTIONS_MENU_RESIZE_TO_FIT_KEY,
  MORE_LAYOUT_OPTIONS_MENU_SET_HEIGHT_TO_FILL_CONTAINER_KEY,
  MORE_LAYOUT_OPTIONS_MENU_SET_HEIGHT_TO_HUG_CONTENTS_KEY,
  MORE_LAYOUT_OPTIONS_MENU_SET_WIDTH_TO_FILL_CONTAINER_KEY,
  MORE_LAYOUT_OPTIONS_MENU_SET_WIDTH_TO_HUG_CONTENTS_KEY,
  MORE_LAYOUT_OPTIONS_MENU_SUGGEST_AUTO_LAYOUT_KEY,
  MORE_LAYOUT_OPTIONS_MENU_UNLOCK_ASPECT_RATIO_KEY,
} from './constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';

const { MenuItem, MenuSeparator } = MenuCompound;

const MoreLayoutOptionsMenu: FC = () => {
  const { t } = useTranslation();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const onResizeToFit = useResizeToFitSelection();
  const canResizeToFit = selectedNode?.type === NodeType.frame && selectedNode.childIds.length > 0;

  return (
    <>
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_SUGGEST_AUTO_LAYOUT_KEY)} shortcut="⌃⇧A" withCheck={false} />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_REMOVE_ALL_AUTO_LAYOUT_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_LOCK_ASPECT_RATIO_KEY)} withCheck={false} />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_UNLOCK_ASPECT_RATIO_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem
        disabled={!canResizeToFit}
        label={t(MORE_LAYOUT_OPTIONS_MENU_RESIZE_TO_FIT_KEY)}
        onClick={onResizeToFit}
        shortcut={KEYBOARD_SHORTCUTS.resizeToFit.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_SET_WIDTH_TO_HUG_CONTENTS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_SET_HEIGHT_TO_HUG_CONTENTS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_SET_WIDTH_TO_FILL_CONTAINER_KEY)} withCheck={false} />
      <MenuItem disabled label={t(MORE_LAYOUT_OPTIONS_MENU_SET_HEIGHT_TO_FILL_CONTAINER_KEY)} withCheck={false} />
    </>
  );
};

export default MoreLayoutOptionsMenu;
