import { FC, ReactNode } from 'react';

// components
import { Icon, UITools } from 'shared';

// styles
import styles from '../toolbar-dropdown.module.scss';

export type TToolbarDropdownPlaceholderProps = {
  children: ReactNode;
  label: string;
  triggerAriaLabel: string;
};

const ToolbarDropdownPlaceholder: FC<TToolbarDropdownPlaceholderProps> = ({ children, label, triggerAriaLabel }) => (
  <UITools.ButtonMenu
    className={styles.ToolbarDropdown__trigger}
    side="top"
    trigger={
      <div className={styles.ToolbarDropdown__placeholder}>
        <span className={styles.ToolbarDropdown__label}>{label}</span>
        <Icon name="ChevronDown" size={24} />
      </div>
    }
    triggerAriaLabel={triggerAriaLabel}
  >
    {children}
  </UITools.ButtonMenu>
);

export default ToolbarDropdownPlaceholder;
