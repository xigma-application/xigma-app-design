// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { getItemsWithPatch } from '../../../../utils/getItemsWithPatch';

export const getLayoutGuidesWithVisibility = (guides: TLayoutGuide[], index: number, isHidden: boolean): TLayoutGuide[] =>
  getItemsWithPatch(guides, index, () => ({ visible: isHidden ? undefined : false }));
