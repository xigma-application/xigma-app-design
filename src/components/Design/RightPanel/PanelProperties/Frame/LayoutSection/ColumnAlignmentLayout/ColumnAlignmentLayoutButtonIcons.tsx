import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnAlignmentLayoutButtonIcons = (t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.propertiesTooltip`)} key="properties">
    <Button ariaLabel={t(`${translationNameSpace}.propertiesAriaLabel`)} selected={false}>
      <Icon name="Properties" size={12} />
    </Button>
  </Tooltip>,
];

export default ColumnAlignmentLayoutButtonIcons;
