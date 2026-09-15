import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnPaddingButtonIcons = (isIndividual: boolean, onToggle: TFunc, t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.individualTooltip`)} key="individual-padding">
    <UITools.ButtonIcon
      ariaLabel={t(`${translationNameSpace}.individualAriaLabel`)}
      name="IndividualInsets"
      onClick={onToggle}
      selected={isIndividual}
    />
  </Tooltip>,
];

export default ColumnPaddingButtonIcons;
