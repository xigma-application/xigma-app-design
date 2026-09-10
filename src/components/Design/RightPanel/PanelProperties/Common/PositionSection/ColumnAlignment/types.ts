// @xigma
import { TIconProps } from '@xigma/components';

// others
import { TKeyboardShortcuts } from 'components/Design/types';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export type TAlignmentOption = {
  key: AlignmentHorizontal | AlignmentVertical;
  labelKey: string;
  name: TIconProps['name'];
  shortcutKey: keyof TKeyboardShortcuts;
};
