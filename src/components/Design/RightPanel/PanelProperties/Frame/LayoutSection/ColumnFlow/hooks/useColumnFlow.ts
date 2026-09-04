import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// others
import { FLOW_OPTIONS, translationNameSpace } from '../constants';

// types
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export type TUseColumnFlowResult = {
  onChange: TFunc<[string]>;
  onWrapChange: TFunc;
  toggleButtons: TToggleButton[];
  value: string;
  wrap: boolean;
};

export const useColumnFlow = (): TUseColumnFlowResult => {
  const { t } = useTranslation();
  const [value, setValue] = useState(FLOW_OPTIONS[0].value);
  const [wrap, setWrap] = useState(false);

  return {
    onChange: setValue,
    onWrapChange: () => setWrap((currentWrap) => !currentWrap),
    toggleButtons: FLOW_OPTIONS.map(({ icon, labelKey, value: optionValue }) => ({
      ariaLabel: t(`${translationNameSpace}.${labelKey}`),
      icon,
      tooltip: t(`${translationNameSpace}.${labelKey}`),
      value: optionValue,
    })),
    value,
    wrap,
  };
};
