import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from '../constants';

export const CornerRadiusButtonIcons = (isIndividual: boolean, onToggle: TFunc, t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.cornerRadius.individualTooltip`)} key="individual-corner-radius">
    <Button
      ariaLabel={t(`${translationNameSpace}.cornerRadius.individualAriaLabel`)}
      onClick={onToggle}
      selected={isIndividual}
      style={{ padding: 0 }}
    >
      <Icon name="Corners" size={24} />
    </Button>
  </Tooltip>,
];

export default CornerRadiusButtonIcons;
