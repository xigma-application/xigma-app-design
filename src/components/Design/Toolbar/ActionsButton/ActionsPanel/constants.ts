// others
import { KEYBOARD_SHORTCUTS } from '../../../keys';
import { translationNameSpace as toolbarNamespace } from '../../constants';

// types
import { TActionsPanelItem, TActionsPanelSection } from './types';
import { TTab } from 'shared/UITools/Tabs/types';

export const translationNameSpace = `${toolbarNamespace}.actionsPanel`;

export const ITEM_ICON_SIZE = 20;

export const TABS: TTab[] = [
  { labelTranslationKey: `${translationNameSpace}.tabAll`, name: 'all' },
  { disabled: true, labelTranslationKey: 'design.leftPanel.navRail.item.assets', name: 'assets' },
  { disabled: true, labelTranslationKey: `${translationNameSpace}.tabPluginsWidgets`, name: 'pluginsWidgets' },
];

export const SECTION_LABEL_KEY: Record<TActionsPanelSection, string> = {
  commonSettings: `${translationNameSpace}.commonSettings`,
  recents: `${translationNameSpace}.recents`,
  suggestions: `${translationNameSpace}.suggestions`,
};

export const SECTION_ORDER: TActionsPanelSection[] = ['recents', 'suggestions', 'commonSettings'];

export const ITEMS: TActionsPanelItem[] = [
  {
    icon: 'Settings',
    id: 'accountSettings',
    labelKey: 'design.leftPanel.navRail.logoMenu.helpAndAccountMenu.accountSettings',
    section: 'recents',
  },
  { icon: 'Rule', id: 'nudgeAmount', labelKey: 'design.leftPanel.navRail.logoMenu.preferencesMenu.nudgeAmount', section: 'recents' },
  { icon: 'Search', id: 'findAndReplace', labelKey: 'design.leftPanel.navRail.logoMenu.editMenu.findAndReplace', section: 'suggestions' },
  {
    action: 'selectAll',
    icon: 'Target',
    id: 'selectAll',
    labelKey: 'design.leftPanel.navRail.logoMenu.editMenu.selectAll',
    section: 'suggestions',
    shortcut: KEYBOARD_SHORTCUTS.selectAll.join(''),
  },
  {
    action: 'undo',
    id: 'undo',
    labelKey: 'design.leftPanel.navRail.logoMenu.editMenu.undo',
    section: 'suggestions',
    shortcut: KEYBOARD_SHORTCUTS.undo.join(''),
  },
  {
    id: 'showRulers',
    labelKey: `${translationNameSpace}.showRulers`,
    section: 'commonSettings',
    shortcut: KEYBOARD_SHORTCUTS.rulers.join(''),
    withCheck: true,
  },
  {
    id: 'snapToPixelGrid',
    labelKey: 'design.leftPanel.navRail.logoMenu.preferencesMenu.snapToPixelGrid',
    section: 'commonSettings',
    shortcut: KEYBOARD_SHORTCUTS.snapToPixelGrid.join(''),
    withCheck: true,
  },
  {
    action: 'toggleUiMinimized',
    id: 'minimizeUi',
    labelKey: 'design.leftPanel.navRail.logoMenu.viewMenu.minimizeUi',
    section: 'commonSettings',
    shortcut: KEYBOARD_SHORTCUTS.toggleUiMinimized.join(''),
    withCheck: true,
  },
  {
    action: 'toggleUiHidden',
    id: 'showHideUi',
    labelKey: 'design.leftPanel.navRail.logoMenu.viewMenu.showHideUi',
    section: 'commonSettings',
    shortcut: KEYBOARD_SHORTCUTS.showHideUi.join(''),
    withCheck: true,
  },
  {
    id: 'multiplayerCursors',
    labelKey: 'design.leftPanel.navRail.logoMenu.viewMenu.multiplayerCursors',
    section: 'commonSettings',
    shortcut: KEYBOARD_SHORTCUTS.multiplayerCursors.join(''),
    withCheck: true,
  },
  {
    icon: 'Keyboard',
    id: 'keyboardShortcuts',
    labelKey: 'design.leftPanel.navRail.logoMenu.helpAndAccountMenu.keyboardShortcuts',
    section: 'commonSettings',
    shortcut: '⌃⇧?',
  },
];
