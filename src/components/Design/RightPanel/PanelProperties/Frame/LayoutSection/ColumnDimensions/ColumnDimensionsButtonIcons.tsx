import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnDimensionsButtonIcons = (locked: boolean, onToggleLock: TFunc, t: TFunction): ReactNode[] => [
  <Tooltip content={t(`${translationNameSpace}.lockTooltip`)} key="lock-aspect-ratio">
    <Button ariaLabel={t(`${translationNameSpace}.lockAriaLabel`)} onClick={onToggleLock} selected={locked}>
      <Icon name="AspectRatio" size={12} />
    </Button>
  </Tooltip>,
];

export default ColumnDimensionsButtonIcons;
