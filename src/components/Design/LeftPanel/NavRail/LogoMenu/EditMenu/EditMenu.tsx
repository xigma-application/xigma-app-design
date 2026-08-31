import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CopyAsMenu from './CopyAsMenu/CopyAsMenu';
import SelectAllWithMenu from './SelectAllWithMenu/SelectAllWithMenu';
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { NODE_MENU_PASTE_TO_REPLACE_KEY } from 'components/Design/Menu/constants';
import {
  EDIT_MENU_COPY_AS_KEY,
  EDIT_MENU_COPY_PROPERTIES_KEY,
  EDIT_MENU_DELETE_KEY,
  EDIT_MENU_DUPLICATE_KEY,
  EDIT_MENU_FIND_AND_REPLACE_KEY,
  EDIT_MENU_FIND_KEY,
  EDIT_MENU_FIND_NEXT_KEY,
  EDIT_MENU_FIND_PREVIOUS_KEY,
  EDIT_MENU_PASTE_OVER_SELECTION_KEY,
  EDIT_MENU_PASTE_PROPERTIES_KEY,
  EDIT_MENU_PICK_COLOR_KEY,
  EDIT_MENU_REDO_KEY,
  EDIT_MENU_SELECT_ALL_KEY,
  EDIT_MENU_SELECT_ALL_WITH_KEY,
  EDIT_MENU_SELECT_INVERSE_KEY,
  EDIT_MENU_SELECT_MATCHING_LAYERS_KEY,
  EDIT_MENU_SELECT_NONE_KEY,
  EDIT_MENU_SET_DEFAULT_PROPERTIES_KEY,
  EDIT_MENU_UNDO_KEY,
} from './constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const EditMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(EDIT_MENU_UNDO_KEY)} shortcut={KEYBOARD_SHORTCUTS.undo.join('')} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_REDO_KEY)} shortcut={KEYBOARD_SHORTCUTS.redo.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuSub label={t(EDIT_MENU_COPY_AS_KEY)}>
        <CopyAsMenu />
      </MenuSub>
      <MenuItem
        disabled
        label={t(EDIT_MENU_PASTE_OVER_SELECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.pasteOverSelection.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(NODE_MENU_PASTE_TO_REPLACE_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.pasteToReplace.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(EDIT_MENU_DUPLICATE_KEY)} shortcut={KEYBOARD_SHORTCUTS.duplicate.join('')} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_DELETE_KEY)} shortcut={KEYBOARD_SHORTCUTS.delete.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(EDIT_MENU_FIND_KEY)} shortcut={KEYBOARD_SHORTCUTS.find.join('')} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_FIND_NEXT_KEY)} shortcut={KEYBOARD_SHORTCUTS.findNext.join('')} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_FIND_PREVIOUS_KEY)} shortcut={KEYBOARD_SHORTCUTS.findPrevious.join('')} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_FIND_AND_REPLACE_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(EDIT_MENU_SET_DEFAULT_PROPERTIES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_COPY_PROPERTIES_KEY)} shortcut={KEYBOARD_SHORTCUTS.copyProperties.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(EDIT_MENU_PASTE_PROPERTIES_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.pasteProperties.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      <MenuItem disabled label={t(EDIT_MENU_PICK_COLOR_KEY)} shortcut="⌃C" withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(EDIT_MENU_SELECT_ALL_KEY)} shortcut={KEYBOARD_SHORTCUTS.selectAll.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(EDIT_MENU_SELECT_MATCHING_LAYERS_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.selectMatchingLayers.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(EDIT_MENU_SELECT_NONE_KEY)} shortcut={KEYBOARD_SHORTCUTS.selectNone.join('')} withCheck={false} />
      <MenuItem disabled label={t(EDIT_MENU_SELECT_INVERSE_KEY)} shortcut={KEYBOARD_SHORTCUTS.selectInverse.join('')} withCheck={false} />
      <MenuSub label={t(EDIT_MENU_SELECT_ALL_WITH_KEY)}>
        <SelectAllWithMenu />
      </MenuSub>
    </>
  );
};

export default EditMenu;
