import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC, ReactNode } from 'react';

// components
import PopoverItem from './PopoverItem/PopoverItem';
import PopoverSeparator from './PopoverSeparator/PopoverSeparator';

// styles
import styles from './popover.module.scss';

export type TPopoverProps = {
  align?: 'center' | 'end' | 'start';
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
  trigger: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
};

export const Popover: FC<TPopoverProps> = ({
  align = 'start',
  children,
  onOpenChange,
  side = 'bottom',
  sideOffset = 8,
  trigger,
  triggerAriaLabel,
  triggerClassName,
}) => (
  <PopoverPrimitive.Root onOpenChange={onOpenChange}>
    <PopoverPrimitive.Trigger aria-label={triggerAriaLabel} className={triggerClassName}>
      {trigger}
    </PopoverPrimitive.Trigger>
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content align={align} className={styles.Popover} side={side} sideOffset={sideOffset}>
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>
);

export const PopoverCompound = {
  PopoverItem,
  PopoverSeparator,
};

export default Popover;
