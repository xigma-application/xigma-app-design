import cx from 'classnames';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode } from 'react';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// styles
import menuStyles from '../menu.module.scss';
import styles from './menu-sub.module.scss';

export type TMenuSubProps = {
  alignOffset?: number;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  marginBottom?: boolean;
  marginTop?: boolean;
  sideOffset?: number;
  triggerClassName?: string;
};

export const MenuSub: FC<TMenuSubProps> = ({
  alignOffset = -4,
  children,
  className = '',
  disabled = false,
  icon,
  iconSize = 14,
  label,
  marginBottom = false,
  marginTop = false,
  sideOffset = 4,
  triggerClassName = '',
}) => (
  <DropdownMenuPrimitive.Sub>
    <DropdownMenuPrimitive.SubTrigger
      className={cx(
        styles.MenuSub,
        { [styles['MenuSub--marginBottom']]: marginBottom, [styles['MenuSub--marginTop']]: marginTop },
        triggerClassName,
      )}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      <span className={styles.MenuSub__label}>{label}</span>
      <Icon className={styles.MenuSub__chevron} name="ChevronRight" size={14} />
    </DropdownMenuPrimitive.SubTrigger>
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        alignOffset={alignOffset}
        className={cx(menuStyles.Menu, className)}
        collisionPadding={8}
        sideOffset={sideOffset}
      >
        {children}
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Sub>
);

export default MenuSub;
