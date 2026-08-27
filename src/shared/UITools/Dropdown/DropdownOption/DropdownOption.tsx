import * as PopoverPrimitive from '@radix-ui/react-popover';
import cx from 'classnames';
import { FC } from 'react';

// components
import { Icon } from 'shared';

// styles
import styles from './dropdown-option.module.scss';

export type TDropdownOptionProps = { highlighted: boolean; label: string; onClick: TFunc; onMouseEnter: TFunc; selected: boolean };

export const DropdownOption: FC<TDropdownOptionProps> = ({ highlighted, label, onClick, onMouseEnter, selected }) => (
  <PopoverPrimitive.Close asChild>
    <div
      className={cx(styles.DropdownOption, { [styles['DropdownOption--highlighted']]: highlighted })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className={styles.DropdownOption__check} style={{ opacity: selected ? 1 : 0 }}>
        <Icon name="Check" size={12} />
      </span>
      <span className={styles.DropdownOption__label}>{label}</span>
    </div>
  </PopoverPrimitive.Close>
);

export default DropdownOption;
