import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { Icon, Tooltip } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './toggle-button-group.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';
import { TToggleButton } from './types';

export type TToggleButtonGroupProps = {
  e2eValue?: TE2EValue;
  onChange: TFunc<[string]>;
  toggleButtons: TToggleButton[];
  value: string;
};

export const ToggleButtonGroup: FC<TToggleButtonGroupProps> = ({ e2eValue = '', onChange, toggleButtons, value }) => (
  <E2EDataAttribute type={E2EAttribute.toggleButtonGroup} value={e2eValue}>
    <div className={styles.ToggleButtonGroup}>
      {toggleButtons.map(({ ariaLabel, icon, tooltip, value: buttonValue }) => (
        <Tooltip content={tooltip} key={buttonValue}>
          <button
            aria-label={ariaLabel}
            aria-pressed={value === buttonValue}
            className={cx(styles.ToggleButtonGroup__button, { [styles['ToggleButtonGroup__button--selected']]: value === buttonValue })}
            onClick={() => onChange(buttonValue)}
            type="button"
          >
            <Icon name={icon} size={12} />
          </button>
        </Tooltip>
      ))}
    </div>
  </E2EDataAttribute>
);

export default ToggleButtonGroup;
