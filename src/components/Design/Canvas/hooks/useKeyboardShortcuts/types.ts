// hooks
import { TKeyMap } from 'hooks';

// types
import { TVectorSegment, TVectorVertex, TVertexHandleMode } from 'types/design/types';

export type TShortcut = Omit<TKeyMap, 'action' | 'anyKey' | 'conditions'>;

export type TVectorFragment = {
  filledFacePieceKeySets: string[][];
  segments: TVectorSegment[];
  vertexHandleModes: Record<string, TVertexHandleMode>;
  vertices: TVectorVertex[];
};

export type TStandardKeyboardShortcuts = {
  bringToFront: TShortcut;
  copy: TShortcut;
  duplicate: TShortcut;
  escape: TShortcut;
  group: TShortcut;
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
  sendToBack: TShortcut;
  toggleUiMinimized: TShortcut;
  undo: TShortcut;
  ungroup: TShortcut;
};
