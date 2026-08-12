import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { FC, ReactElement, ReactNode } from 'react';

// styles
import styles from './tooltip.module.scss';

export type TTooltipProps = {
  align?: 'center' | 'end' | 'start';
  children: ReactElement;
  content?: ReactNode;
  side?: 'bottom' | 'left' | 'right' | 'top';
  sideOffset?: number;
};

export const Tooltip: FC<TTooltipProps> = ({ align = 'center', children, content, side = 'top', sideOffset = 8 }) => {
  if (!content) {
    return children;
  }

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content align={align} className={styles.Tooltip} side={side} sideOffset={sideOffset}>
          {content}
          <TooltipPrimitive.Arrow className={styles.Tooltip__arrow} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

export default Tooltip;
