import { TFunction } from 'i18next';

// others
import { translationNameSpace } from '../../../constants';

// types
import { SizingMode } from 'types/design/enums';

export type TSizingModeOption = {
  label: string;
  value: SizingMode;
};

export const getSizingModeOptions = (t: TFunction): TSizingModeOption[] =>
  [SizingMode.fill, SizingMode.fixed, SizingMode.hug].map((mode) => ({
    label: t(`${translationNameSpace}.mode.${mode}`),
    value: mode,
  }));
