import cx from 'classnames';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC, ReactNode } from 'react';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import PopoverItem from './PopoverItem/PopoverItem';
import PopoverScrollArea from './PopoverScrollArea/PopoverScrollArea';
import PopoverSeparator from './PopoverSeparator/PopoverSeparator';

// hooks
import { usePopoverDrag } from './hooks/usePopoverDrag';

// styles
import styles from './popover.module.scss';

export type TPopoverProps = {
  align?: 'center' | 'end' | 'start';
  asChild?: boolean;
  avoidCollisions?: boolean;
  children: ReactNode;
  className?: string;
  moveable?: boolean;
  onInteractOutside?: (event: Event) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  scrollable?: boolean;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
  trigger: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  triggerTooltip?: ReactNode;
};

export const Popover: FC<TPopoverProps> = ({
  align = 'start',
  asChild = false,
  avoidCollisions = true,
  children,
  className = '',
  moveable = false,
  onInteractOutside,
  onOpenChange,
  open,
  scrollable = false,
  side = 'bottom',
  sideOffset = 8,
  trigger,
  triggerAriaLabel,
  triggerClassName,
  triggerTooltip,
}) => {
  const { handleOpenChange, offset, onPointerDown, onPointerMove, onPointerUp } = usePopoverDrag(moveable, onOpenChange);

  return (
    <PopoverPrimitive.Root onOpenChange={handleOpenChange} open={open}>
      <Tooltip content={triggerTooltip}>
        <PopoverPrimitive.Trigger aria-label={triggerAriaLabel} asChild={asChild} className={triggerClassName}>
          {trigger}
        </PopoverPrimitive.Trigger>
      </Tooltip>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          avoidCollisions={avoidCollisions}
          className={cx(styles.Popover, { [styles['Popover--scrollable']]: scrollable }, className)}
          collisionPadding={scrollable ? 10 : undefined}
          onInteractOutside={onInteractOutside}
          onPointerDown={moveable ? onPointerDown : undefined}
          onPointerMove={moveable ? onPointerMove : undefined}
          onPointerUp={moveable ? onPointerUp : undefined}
          side={side}
          sideOffset={sideOffset}
          style={moveable ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
        >
          {scrollable ? <PopoverScrollArea>{children}</PopoverScrollArea> : children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export const PopoverCompound = {
  PopoverItem,
  PopoverSeparator,
};

export default Popover;
