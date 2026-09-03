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
  flatten: TShortcut;
  flipHorizontal: TShortcut;
  flipVertical: TShortcut;
  group: TShortcut;
  nudgeDown: TShortcut;
  nudgeDownAlt: TShortcut;
  nudgeDownAltLarge: TShortcut;
  nudgeDownLarge: TShortcut;
  nudgeLeft: TShortcut;
  nudgeLeftAlt: TShortcut;
  nudgeLeftAltLarge: TShortcut;
  nudgeLeftLarge: TShortcut;
  nudgeRight: TShortcut;
  nudgeRightAlt: TShortcut;
  nudgeRightAltLarge: TShortcut;
  nudgeRightLarge: TShortcut;
  nudgeUp: TShortcut;
  nudgeUpAlt: TShortcut;
  nudgeUpAltLarge: TShortcut;
  nudgeUpLarge: TShortcut;
  openActions: TShortcut;
  outlineStroke: TShortcut;
  paste: TShortcut;
  redo: TShortcut;
  selectAll: TShortcut;
  sendToBack: TShortcut;
  toggleRulers: TShortcut;
  toggleUiHidden: TShortcut;
  toggleUiMinimized: TShortcut;
  undo: TShortcut;
  ungroup: TShortcut;
  useAsMask: TShortcut;
  zoomIn: TShortcut;
  zoomInNumpad: TShortcut;
  zoomOut: TShortcut;
  zoomOutNumpad: TShortcut;
  zoomTo100: TShortcut;
  zoomToFit: TShortcut;
  zoomToNextFrame: TShortcut;
  zoomToPreviousFrame: TShortcut;
  zoomToSelection: TShortcut;
};
