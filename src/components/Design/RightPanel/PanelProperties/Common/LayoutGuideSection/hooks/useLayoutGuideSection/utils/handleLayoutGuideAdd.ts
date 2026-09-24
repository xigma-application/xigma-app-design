// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

export const handleLayoutGuideAdd = (
  isMixed: boolean,
  guidesLength: number,
  commit: TFunc<[TFunc<[TLayoutGuide[]], TLayoutGuide[]>]>,
  onPickerOpenChange: (index: number, isOpen: boolean) => void,
): void => {
  commit((nodeGuides) => [...(isMixed ? [] : nodeGuides), createLayoutGuide(LayoutGuideType.grid)]);
  onPickerOpenChange(guidesLength, true);
};
