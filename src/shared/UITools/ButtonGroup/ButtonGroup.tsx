import { FC } from 'react';
import { kebabCase } from 'lodash';

// @xigma
import { Icon, Tooltip } from '@xigma/components';

// components
import Button from '../Button/Button';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './button-group.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TButtonGroup } from './types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TButtonGroupProps = {
  buttons: TButtonGroup[];
  e2eValue?: TE2EValue;
};

export const ButtonGroup: FC<TButtonGroupProps> = ({ buttons, e2eValue = '' }) => (
  <E2EDataAttribute type={E2EAttribute.buttonGroup} value={e2eValue}>
    <div className={styles.ButtonGroup}>
      {buttons.map(({ ariaLabel, disabled = false, name, onClick, tooltip }) => (
        <Tooltip content={tooltip} key={kebabCase(name)}>
          <Button ariaLabel={ariaLabel} className={styles.ButtonGroup__button} disabled={disabled} onClick={onClick}>
            <Icon name={name} size={12} />
          </Button>
        </Tooltip>
      ))}
    </div>
  </E2EDataAttribute>
);

export default ButtonGroup;
