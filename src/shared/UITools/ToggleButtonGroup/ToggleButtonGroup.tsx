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
  className?: string;
  e2eValue?: TE2EValue;
  onChange: TFunc<[string]>;
  onHoverOption?: TFunc<[string | null]>;
  toggleButtons: TToggleButton[];
  value: string;
};

export const ToggleButtonGroup: FC<TToggleButtonGroupProps> = ({
  className = '',
  e2eValue = '',
  onChange,
  onHoverOption,
  toggleButtons,
  value,
}) => (
  <E2EDataAttribute type={E2EAttribute.toggleButtonGroup} value={e2eValue}>
    <div className={cx(styles.ToggleButtonGroup, className)}>
      {toggleButtons.map(({ ariaLabel, icon, tooltip, value: buttonValue }) => (
        <Tooltip content={tooltip} key={buttonValue}>
          <button
            aria-label={ariaLabel}
            aria-pressed={value === buttonValue}
            className={cx(styles.ToggleButtonGroup__button, { [styles['ToggleButtonGroup__button--selected']]: value === buttonValue })}
            onClick={() => onChange(buttonValue)}
            onMouseEnter={() => onHoverOption?.(buttonValue)}
            onMouseLeave={() => onHoverOption?.(null)}
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
