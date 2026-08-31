import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import BooleanGroupsMenu from './BooleanGroupsMenu/BooleanGroupsMenu';
import MainComponentMenu from './MainComponentMenu/MainComponentMenu';
import MoreLayoutOptionsMenu from './MoreLayoutOptionsMenu/MoreLayoutOptionsMenu';
import SlotsMenu from './SlotsMenu/SlotsMenu';
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { LAYERS_COLLAPSE_ALL_ARIA_LABEL_KEY } from 'components/Design/LeftPanel/File/Layers/constants';
import {
  NODE_MENU_ADD_AUTO_LAYOUT_KEY,
  NODE_MENU_BRING_TO_FRONT_KEY,
  NODE_MENU_CREATE_COMPONENT_KEY,
  NODE_MENU_FLATTEN_KEY,
  NODE_MENU_FLIP_HORIZONTAL_KEY,
  NODE_MENU_FLIP_VERTICAL_KEY,
  NODE_MENU_FRAME_SELECTION_KEY,
  NODE_MENU_GROUP_SELECTION_KEY,
  NODE_MENU_OUTLINE_STROKE_KEY,
  NODE_MENU_SEND_TO_BACK_KEY,
  NODE_MENU_USE_AS_MASK_KEY,
} from 'components/Design/Menu/constants';
import {
  OBJECT_MENU_BOOLEAN_GROUPS_KEY,
  OBJECT_MENU_BRING_FORWARD_KEY,
  OBJECT_MENU_CONVERT_TO_FRAME_KEY,
  OBJECT_MENU_CONVERT_TO_SECTION_KEY,
  OBJECT_MENU_DELETE_CONTENTS_KEY,
  OBJECT_MENU_DETACH_INSTANCE_KEY,
  OBJECT_MENU_HIDE_OTHER_LAYERS_KEY,
  OBJECT_MENU_LOCK_UNLOCK_SELECTION_KEY,
  OBJECT_MENU_MAIN_COMPONENT_KEY,
  OBJECT_MENU_MORE_LAYOUT_OPTIONS_KEY,
  OBJECT_MENU_REMOVE_FILL_KEY,
  OBJECT_MENU_REMOVE_INTERACTIONS_KEY,
  OBJECT_MENU_REMOVE_STROKE_KEY,
  OBJECT_MENU_RESET_INSTANCE_KEY,
  OBJECT_MENU_ROTATE_180_KEY,
  OBJECT_MENU_ROTATE_90_LEFT_KEY,
  OBJECT_MENU_ROTATE_90_RIGHT_KEY,
  OBJECT_MENU_SEND_BACKWARD_KEY,
  OBJECT_MENU_SET_AS_THUMBNAIL_KEY,
  OBJECT_MENU_SHOW_HIDE_SELECTION_KEY,
  OBJECT_MENU_SLOTS_KEY,
  OBJECT_MENU_SWAP_FILL_AND_STROKE_KEY,
  OBJECT_MENU_UNGROUP_SELECTION_KEY,
  OBJECT_MENU_WRAP_IN_NEW_SECTION_KEY,
} from './constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const ObjectMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(NODE_MENU_FRAME_SELECTION_KEY)} shortcut={KEYBOARD_SHORTCUTS.frameSelection.join('')} withCheck={false} />
      <MenuItem disabled label={t(NODE_MENU_GROUP_SELECTION_KEY)} shortcut={KEYBOARD_SHORTCUTS.groupSelection.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(OBJECT_MENU_UNGROUP_SELECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.ungroupSelection.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      <MenuItem
        disabled
        label={t(OBJECT_MENU_WRAP_IN_NEW_SECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.wrapInNewSection.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(OBJECT_MENU_CONVERT_TO_SECTION_KEY)} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_CONVERT_TO_FRAME_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(NODE_MENU_USE_AS_MASK_KEY)} shortcut={KEYBOARD_SHORTCUTS.useAsMask.join('')} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_SET_AS_THUMBNAIL_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(NODE_MENU_ADD_AUTO_LAYOUT_KEY)} shortcut={KEYBOARD_SHORTCUTS.addAutoLayout.join('')} withCheck={false} />
      <MenuSub label={t(OBJECT_MENU_MORE_LAYOUT_OPTIONS_KEY)}>
        <MoreLayoutOptionsMenu />
      </MenuSub>
      <MenuItem
        disabled
        label={t(NODE_MENU_CREATE_COMPONENT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.createComponent.join('')}
        withCheck={false}
      />
      <MenuSub label={t(OBJECT_MENU_SLOTS_KEY)}>
        <SlotsMenu />
      </MenuSub>
      <MenuItem disabled label={t(OBJECT_MENU_RESET_INSTANCE_KEY)} withCheck={false} />
      <MenuItem
        disabled
        label={t(OBJECT_MENU_DETACH_INSTANCE_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.detachInstance.join('')}
        withCheck={false}
      />
      <MenuSub label={t(OBJECT_MENU_MAIN_COMPONENT_KEY)}>
        <MainComponentMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem disabled label={t(NODE_MENU_BRING_TO_FRONT_KEY)} shortcut={KEYBOARD_SHORTCUTS.bringToFront.join('')} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_BRING_FORWARD_KEY)} shortcut={KEYBOARD_SHORTCUTS.bringForward.join('')} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_SEND_BACKWARD_KEY)} shortcut={KEYBOARD_SHORTCUTS.sendBackward.join('')} withCheck={false} />
      <MenuItem disabled label={t(NODE_MENU_SEND_TO_BACK_KEY)} shortcut={KEYBOARD_SHORTCUTS.sendToBack.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(NODE_MENU_FLIP_HORIZONTAL_KEY)} shortcut={KEYBOARD_SHORTCUTS.flipHorizontal.join('')} withCheck={false} />
      <MenuItem disabled label={t(NODE_MENU_FLIP_VERTICAL_KEY)} shortcut={KEYBOARD_SHORTCUTS.flipVertical.join('')} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_ROTATE_180_KEY)} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_ROTATE_90_LEFT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_ROTATE_90_RIGHT_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(NODE_MENU_FLATTEN_KEY)} shortcut={KEYBOARD_SHORTCUTS.flatten.join('')} withCheck={false} />
      <MenuItem disabled label={t(NODE_MENU_OUTLINE_STROKE_KEY)} shortcut={KEYBOARD_SHORTCUTS.outlineStroke.join('')} withCheck={false} />
      <MenuSub label={t(OBJECT_MENU_BOOLEAN_GROUPS_KEY)}>
        <BooleanGroupsMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem
        disabled
        label={t(OBJECT_MENU_SHOW_HIDE_SELECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.hideShowLayer.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(OBJECT_MENU_LOCK_UNLOCK_SELECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.lockUnlockLayer.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(OBJECT_MENU_HIDE_OTHER_LAYERS_KEY)} withCheck={false} />
      <MenuItem
        disabled
        label={t(LAYERS_COLLAPSE_ALL_ARIA_LABEL_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.collapseLayers.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      <MenuItem disabled label={t(OBJECT_MENU_REMOVE_FILL_KEY)} shortcut={KEYBOARD_SHORTCUTS.removeFill.join('')} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_REMOVE_STROKE_KEY)} shortcut={KEYBOARD_SHORTCUTS.removeStroke.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(OBJECT_MENU_SWAP_FILL_AND_STROKE_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.swapFillAndStroke.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(OBJECT_MENU_REMOVE_INTERACTIONS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(OBJECT_MENU_DELETE_CONTENTS_KEY)} withCheck={false} />
    </>
  );
};

export default ObjectMenu;
