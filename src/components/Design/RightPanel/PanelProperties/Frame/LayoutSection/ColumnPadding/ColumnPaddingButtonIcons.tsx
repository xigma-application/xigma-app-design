import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnPaddingButtonIcons = (isIndividual: boolean, onToggle: TFunc, t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.individualTooltip`)} key="individual-padding">
    <Button ariaLabel={t(`${translationNameSpace}.individualAriaLabel`)} onClick={onToggle} selected={isIndividual} style={{ padding: 0 }}>
      <Icon name="IndividualInsets" size={24} />
    </Button>
  </Tooltip>,
];

export default ColumnPaddingButtonIcons;
