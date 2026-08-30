import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AdjustMenu from './AdjustMenu/AdjustMenu';
import AlignmentMenu from './AlignmentMenu/AlignmentMenu';
import CaseMenu from './CaseMenu/CaseMenu';
import SpellCheckMenu from './SpellCheckMenu/SpellCheckMenu';
import TextDirectionMenu from './TextDirectionMenu/TextDirectionMenu';
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  TEXT_MENU_ADJUST_KEY,
  TEXT_MENU_ALIGNMENT_KEY,
  TEXT_MENU_BOLD_KEY,
  TEXT_MENU_BULLETED_LIST_KEY,
  TEXT_MENU_CASE_KEY,
  TEXT_MENU_CREATE_LINK_KEY,
  TEXT_MENU_ITALIC_KEY,
  TEXT_MENU_NUMBERED_LIST_KEY,
  TEXT_MENU_SPELL_CHECK_KEY,
  TEXT_MENU_STRIKETHROUGH_KEY,
  TEXT_MENU_TEXT_DIRECTION_KEY,
  TEXT_MENU_UNDERLINE_KEY,
} from './constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const TextMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(TEXT_MENU_BOLD_KEY)} shortcut={KEYBOARD_SHORTCUTS.bold.join('')} withCheck={false} />
      <MenuItem disabled label={t(TEXT_MENU_ITALIC_KEY)} shortcut={KEYBOARD_SHORTCUTS.italic.join('')} withCheck={false} />
      <MenuItem disabled label={t(TEXT_MENU_UNDERLINE_KEY)} shortcut={KEYBOARD_SHORTCUTS.underline.join('')} withCheck={false} />
      <MenuItem disabled label={t(TEXT_MENU_STRIKETHROUGH_KEY)} shortcut={KEYBOARD_SHORTCUTS.strikethrough.join('')} withCheck={false} />
      <MenuItem disabled label={t(TEXT_MENU_CREATE_LINK_KEY)} shortcut={KEYBOARD_SHORTCUTS.createLink.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(TEXT_MENU_BULLETED_LIST_KEY)} shortcut={KEYBOARD_SHORTCUTS.bulletedList.join('')} withCheck={false} />
      <MenuItem disabled label={t(TEXT_MENU_NUMBERED_LIST_KEY)} shortcut={KEYBOARD_SHORTCUTS.numberedList.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuSub label={t(TEXT_MENU_ALIGNMENT_KEY)}>
        <AlignmentMenu />
      </MenuSub>
      <MenuSub label={t(TEXT_MENU_ADJUST_KEY)}>
        <AdjustMenu />
      </MenuSub>
      <MenuSub label={t(TEXT_MENU_CASE_KEY)}>
        <CaseMenu />
      </MenuSub>
      <MenuSub label={t(TEXT_MENU_TEXT_DIRECTION_KEY)}>
        <TextDirectionMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuSub label={t(TEXT_MENU_SPELL_CHECK_KEY)}>
        <SpellCheckMenu />
      </MenuSub>
    </>
  );
};

export default TextMenu;
