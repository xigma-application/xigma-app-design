import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// others
import { FLOW_OPTIONS, translationNameSpace } from '../constants';

// types
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export type TUseColumnFlowResult = {
  onChange: TFunc<[string]>;
  toggleButtons: TToggleButton[];
  value: string;
};

export const useColumnFlow = (): TUseColumnFlowResult => {
  const { t } = useTranslation();
  const [value, setValue] = useState(FLOW_OPTIONS[0].value);

  return {
    onChange: setValue,
    toggleButtons: FLOW_OPTIONS.map(({ icon, labelKey, value: optionValue }) => ({
      ariaLabel: t(`${translationNameSpace}.${labelKey}`),
      icon,
      tooltip: t(`${translationNameSpace}.${labelKey}`),
      value: optionValue,
    })),
    value,
  };
};
