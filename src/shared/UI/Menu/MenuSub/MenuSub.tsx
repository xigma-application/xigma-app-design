import cx from 'classnames';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC, PointerEvent, ReactNode, useEffect, useRef, useState } from 'react';

// @xigma
import { Icon, TIconProps } from '@xigma/components';

// others
import { MENU_SUB_HOVER_OPEN_DELAY_MS } from './constants';

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
}) => {
  const [open, setOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearOpenTimer = (): void => {
    clearTimeout(openTimerRef.current);
    openTimerRef.current = undefined;
  };

  useEffect(() => clearOpenTimer, []);

  return (
    <DropdownMenuPrimitive.Sub onOpenChange={setOpen} open={open}>
      <DropdownMenuPrimitive.SubTrigger
        className={cx(
          styles.MenuSub,
          { [styles['MenuSub--marginBottom']]: marginBottom, [styles['MenuSub--marginTop']]: marginTop },
          triggerClassName,
        )}
        disabled={disabled}
        onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
          if (disabled) {
            return;
          }

          const trigger = event.currentTarget;
          clearOpenTimer();
          openTimerRef.current = setTimeout(() => {
            trigger.focus({ preventScroll: true });
            setOpen(true);
          }, MENU_SUB_HOVER_OPEN_DELAY_MS);
        }}
        onPointerLeave={clearOpenTimer}
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
};

export default MenuSub;
