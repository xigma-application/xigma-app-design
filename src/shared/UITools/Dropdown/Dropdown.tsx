import * as PopoverPrimitive from '@radix-ui/react-popover';
import cx from 'classnames';
import { ReactElement } from 'react';

// components
import DropdownPanel from './DropdownPanel/DropdownPanel';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import { Icon } from 'shared';

// hooks
import { useDropdownState } from './hooks/useDropdownState';

// styles
import styles from './dropdown.module.scss';

// types
import { TDropdownOption } from './types';
import { E2EAttribute } from 'types/e2e';

export type TDropdownProps<TValue extends string> = {
  className?: string;
  onSelect: TFunc<[TValue]>;
  options: TDropdownOption<TValue>[];
  value: TValue;
};

export const Dropdown = <TValue extends string>({ className = '', onSelect, options, value }: TDropdownProps<TValue>): ReactElement => {
  const selectedOption = options.find((option) => option.value === value);
  const { handleKeyDown, handleOpenChange, highlightedIndex, isOpen, setHighlightedIndex } = useDropdownState(options, value, onSelect);

  return (
    <PopoverPrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
      <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
        <PopoverPrimitive.Trigger className={cx(styles.Dropdown, className)}>
          <span className={styles.Dropdown__label}>{selectedOption?.label}</span>
          <Icon name="ChevronDown" size={12} />
        </PopoverPrimitive.Trigger>
      </E2EDataAttribute>
      <PopoverPrimitive.Portal>
        <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
          <PopoverPrimitive.Content
            align="center"
            className={styles.Dropdown__content}
            onKeyDown={handleKeyDown}
            side="bottom"
            sideOffset={4}
          >
            <DropdownPanel
              highlightedIndex={highlightedIndex}
              onHighlight={setHighlightedIndex}
              onSelect={onSelect}
              options={options}
              value={value}
            />
          </PopoverPrimitive.Content>
        </E2EDataAttribute>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default Dropdown;
