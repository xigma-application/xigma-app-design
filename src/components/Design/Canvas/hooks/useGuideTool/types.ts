// types
import { RefObject } from 'react';
import { TGuideAxis } from 'types/design/guides/types';
import { TVirtualAnchor } from 'shared';

export type TSelectedGuide = {
  frameId: string | null;
  id: string;
};

export type TRulerMenu = {
  axis: TGuideAxis;
};

export type TUseGuideTool = {
  anchorRef: RefObject<TVirtualAnchor>;
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  removeAllGuides: () => void;
  removeSelectedGuide: () => void;
  rulerMenu: TRulerMenu | null;
  selectedGuide: TSelectedGuide | null;
};
