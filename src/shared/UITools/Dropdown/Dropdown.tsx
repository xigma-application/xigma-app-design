import * as PopoverPrimitive from '@radix-ui/react-popover';
import cx from 'classnames';
import { ReactElement } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// components
import DropdownPanel from './DropdownPanel/DropdownPanel';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import { Icon } from 'shared';

// hooks
import { useDropdownHoverOption } from './hooks/useDropdownHoverOption';
import { useDropdownState } from './hooks/useDropdownState';

// styles
import styles from './dropdown.module.scss';

// types
import { TDropdownOption, TDropdownSize, TDropdownVariant } from './types';
import { E2EAttribute } from 'types/e2e';

export type TDropdownProps<TValue extends string> = {
  bypassGlobalShortcuts?: boolean;
  className?: string;
  disabled?: boolean;
  icon?: TIconProps['name'];
  menuMaxHeight?: number;
  menuWidth?: number;
  onHoverOption?: TFunc<[TValue | null]>;
  onSelect: TFunc<[TValue]>;
  options: TDropdownOption<TValue>[];
  size?: TDropdownSize;
  textAlign?: 'center' | 'left';
  truncate?: boolean;
  value: TValue;
  variant?: TDropdownVariant;
};

export const Dropdown = <TValue extends string>({
  bypassGlobalShortcuts = true,
  className = '',
  disabled = false,
  icon,
  menuMaxHeight,
  menuWidth,
  onHoverOption,
  onSelect,
  options,
  size = 'default',
  textAlign = 'center',
  truncate = true,
  value,
  variant = 'filled',
}: TDropdownProps<TValue>): ReactElement => {
  const selectedOption = options.find((option) => option.value === value);
  const { handleKeyDown, handleOpenChange, highlightedIndex, isOpen, setHighlightedIndex } = useDropdownState(options, value, onSelect);

  useDropdownHoverOption(options, highlightedIndex, isOpen, onHoverOption);

  const trigger = (
    <PopoverPrimitive.Trigger
      className={cx(
        styles.Dropdown,
        { [styles['Dropdown--large']]: size === 'large', [styles['Dropdown--outline']]: variant === 'outline' },
        className,
      )}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={24} />}
      <span
        className={cx(styles.Dropdown__label, {
          [styles['Dropdown__label--left']]: textAlign === 'left',
          [styles['Dropdown__label--no-truncate']]: !truncate,
        })}
      >
        {selectedOption?.content ?? selectedOption?.triggerLabel ?? selectedOption?.label}
      </span>
      <Icon name="ChevronDown" size={24} />
    </PopoverPrimitive.Trigger>
  );

  const content = (
    <PopoverPrimitive.Content align="center" className={styles.Dropdown__content} onKeyDown={handleKeyDown} side="bottom" sideOffset={4}>
      <DropdownPanel
        highlightedIndex={highlightedIndex}
        menuMaxHeight={menuMaxHeight}
        menuWidth={menuWidth}
        onHighlight={setHighlightedIndex}
        onSelect={onSelect}
        options={options}
        value={value}
      />
    </PopoverPrimitive.Content>
  );

  return (
    <PopoverPrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
      {bypassGlobalShortcuts ? (
        <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
          {trigger}
        </E2EDataAttribute>
      ) : (
        trigger
      )}
      <PopoverPrimitive.Portal>
        {bypassGlobalShortcuts ? (
          <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
            {content}
          </E2EDataAttribute>
        ) : (
          content
        )}
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default Dropdown;
