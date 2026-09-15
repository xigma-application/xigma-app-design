import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

export const CornerRadiusButtonIcons = (isIndividual: boolean, onToggle: TFunc, t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.cornerRadius.individualTooltip`)} key="individual-corner-radius">
    <UITools.ButtonIcon
      ariaLabel={t(`${translationNameSpace}.cornerRadius.individualAriaLabel`)}
      name="Corners"
      onClick={onToggle}
      selected={isIndividual}
    />
  </Tooltip>,
];

export default CornerRadiusButtonIcons;
