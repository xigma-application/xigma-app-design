import { FC, ReactNode } from 'react';

// components
import ToolbarDropdownOption, { TToolbarDropdownOptionProps } from './ToolbarDropdownOption/ToolbarDropdownOption';
import ToolbarDropdownPlaceholder from './ToolbarDropdownPlaceholder/ToolbarDropdownPlaceholder';

export type TToolbarDropdownOption = Omit<TToolbarDropdownOptionProps, 'children' | 'triggerAriaLabel'>;

export type TToolbarDropdownProps = {
  children: ReactNode;
  option: TToolbarDropdownOption | null;
  placeholderLabel: string;
  triggerAriaLabel: string;
};

const ToolbarDropdown: FC<TToolbarDropdownProps> = ({ children, option, placeholderLabel, triggerAriaLabel }) => {
  if (option !== null) {
    return (
      <ToolbarDropdownOption {...option} triggerAriaLabel={triggerAriaLabel}>
        {children}
      </ToolbarDropdownOption>
    );
  }

  return (
    <ToolbarDropdownPlaceholder label={placeholderLabel} triggerAriaLabel={triggerAriaLabel}>
      {children}
    </ToolbarDropdownPlaceholder>
  );
};

export default ToolbarDropdown;
