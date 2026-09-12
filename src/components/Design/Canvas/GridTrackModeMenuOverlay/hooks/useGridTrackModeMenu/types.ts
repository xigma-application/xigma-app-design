import { RefObject } from 'react';

// shared
import { TVirtualAnchor } from 'shared';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackModeMenuOption } from '../../utils/getGridTrackModeMenuOptions';

export type TGridTrackModeMenu = {
  anchorRef: RefObject<TVirtualAnchor>;
  isOpen: boolean;
  mode: SizingMode | null;
  onOpenChange: TFunc<[boolean]>;
  onSelectMode: TFunc<[SizingMode]>;
  options: TGridTrackModeMenuOption[];
};
