import cx from 'classnames';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC, MouseEvent, ReactNode, RefObject } from 'react';

// components
import MenuItem from './MenuItem/MenuItem';
import MenuSeparator from './MenuSeparator/MenuSeparator';
import MenuSub from './MenuSub/MenuSub';
import MenuTrigger from './MenuTrigger/MenuTrigger';

// styles
import styles from './menu.module.scss';

// types
import { TVirtualAnchor } from '../Tree/TreeItem/types';

export type TMenuProps = {
  align?: 'center' | 'end' | 'start';
  anchorRef?: RefObject<TVirtualAnchor>;
  children: ReactNode;
  className?: string;
  onClick?: TFunc<[MouseEvent]>;
  onCloseAutoFocus?: TFunc<[Event]>;
  onOpenChange?: TFunc<[boolean]>;
  open?: boolean;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
  trigger?: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
};

export const Menu: FC<TMenuProps> = ({
  align = 'start',
  anchorRef,
  children,
  className = '',
  onClick,
  onCloseAutoFocus,
  onOpenChange,
  open,
  side = 'bottom',
  sideOffset = 8,
  trigger,
  triggerAriaLabel,
  triggerClassName,
}) => (
  <DropdownMenuPrimitive.Root onOpenChange={onOpenChange} open={open}>
    <MenuTrigger anchorRef={anchorRef} trigger={trigger} triggerAriaLabel={triggerAriaLabel} triggerClassName={triggerClassName} />
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        className={cx(styles.Menu, className)}
        collisionPadding={8}
        onClick={onClick}
        onCloseAutoFocus={onCloseAutoFocus}
        side={side}
        sideOffset={sideOffset}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>
);

export const MenuCompound = {
  MenuItem,
  MenuSeparator,
  MenuSub,
};

export default Menu;
