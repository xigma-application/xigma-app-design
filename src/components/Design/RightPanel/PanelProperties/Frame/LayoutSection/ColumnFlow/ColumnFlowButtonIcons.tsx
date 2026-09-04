import { ReactNode } from 'react';
import { TFunction } from 'i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { translationNameSpace } from './constants';

export const ColumnFlowButtonIcons = (value: string, wrap: boolean, onWrapChange: TFunc, t: TFunction): ReactNode[] =>
  value === 'horizontal'
    ? [
        <Tooltip content={t(`${translationNameSpace}.wrapTooltip`)} key="wrap">
          <Button ariaLabel={t(`${translationNameSpace}.wrapAriaLabel`)} onClick={onWrapChange} selected={wrap}>
            <Icon name="Wrap" size={12} />
          </Button>
        </Tooltip>,
      ]
    : [];

export default ColumnFlowButtonIcons;
