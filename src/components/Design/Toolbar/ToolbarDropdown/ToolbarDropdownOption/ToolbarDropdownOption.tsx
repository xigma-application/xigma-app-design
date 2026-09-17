import cx from 'classnames';
import { FC, ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// components
import { Icon, Tooltip, UITools } from 'shared';

// styles
import toolbarButtonStyles from '../../ToolbarButton/toolbar-button.module.scss';
import styles from '../toolbar-dropdown.module.scss';

export type TToolbarDropdownOptionProps = {
  children: ReactNode;
  icon: TIconProps['name'];
  isActive: boolean;
  isDisabled?: boolean;
  label: string;
  onClick?: TFunc;
  shortcut?: string;
  triggerAriaLabel: string;
};

const ToolbarDropdownOption: FC<TToolbarDropdownOptionProps> = ({
  children,
  icon,
  isActive,
  isDisabled = false,
  label,
  onClick,
  shortcut,
  triggerAriaLabel,
}) => (
  <div className={styles.ToolbarDropdown__group}>
    <Tooltip
      content={
        <>
          {label}
          {shortcut && <span className={toolbarButtonStyles.ToolbarButton__shortcut}>{shortcut}</span>}
        </>
      }
    >
      <UITools.ButtonIcon
        active={isActive}
        ariaLabel={label}
        className={cx(toolbarButtonStyles.ToolbarButton, { [toolbarButtonStyles['ToolbarButton--active']]: isActive })}
        color={isActive ? 'onBlue1' : 'neutral1'}
        disabled={isDisabled}
        name={icon}
        onClick={onClick}
      />
    </Tooltip>
    <UITools.ButtonMenu
      className={styles.ToolbarDropdown__chevron}
      side="top"
      trigger={<Icon name="ChevronDown" size={16} />}
      triggerAriaLabel={triggerAriaLabel}
    >
      {children}
    </UITools.ButtonMenu>
  </div>
);

export default ToolbarDropdownOption;
