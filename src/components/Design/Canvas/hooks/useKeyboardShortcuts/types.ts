// hooks
import { TKeyMap } from 'hooks';

export type TShortcut = Omit<TKeyMap, 'action' | 'anyKey' | 'conditions'>;

export type TStandardKeyboardShortcuts = {
  copy: TShortcut;
  duplicate: TShortcut;
  escape: TShortcut;
  nudgeDown: TShortcut;
  nudgeDownLarge: TShortcut;
  nudgeLeft: TShortcut;
  nudgeLeftLarge: TShortcut;
  nudgeRight: TShortcut;
  nudgeRightLarge: TShortcut;
  nudgeUp: TShortcut;
  nudgeUpLarge: TShortcut;
  paste: TShortcut;
  redo: TShortcut;
  selectAll: TShortcut;
  undo: TShortcut;
};
