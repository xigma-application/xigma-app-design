import cx from 'classnames';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC } from 'react';

// styles
import styles from './menu-separator.module.scss';

export type TMenuSeparatorProps = {
  className?: string;
};

export const MenuSeparator: FC<TMenuSeparatorProps> = ({ className = '' }) => (
  <DropdownMenuPrimitive.Separator className={cx(styles.MenuSeparator, className)} />
);

export default MenuSeparator;
